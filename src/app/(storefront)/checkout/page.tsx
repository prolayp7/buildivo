"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckoutStepper } from "@/components/checkout/checkout-stepper";
import { CheckoutOrderSummary } from "@/components/checkout/checkout-order-summary";
import { StepIdentity } from "@/components/checkout/steps/step-identity";
import { StepAddress } from "@/components/checkout/steps/step-address";
import { StepDelivery } from "@/components/checkout/steps/step-delivery";
import { StepPayment, type PaymentMethodId } from "@/components/checkout/steps/step-payment";
import { StepReview } from "@/components/checkout/steps/step-review";
import { StepProcessing } from "@/components/checkout/steps/step-processing";
import { StepFailed } from "@/components/checkout/steps/step-failed";
import { useCartStore, useCartTotals } from "@/lib/cart-store";
import { fetchShippingQuotes, placeOrder as placeOrderApi, type PlacedOrder, type ShippingQuote } from "@/lib/storefront-client";
import { CHECKOUT_RETURN_KEY, capturePaymentAttempt, createPaymentAttempt } from "@/lib/payments";
import type { Address } from "@/types";

const emptyAddress: Address = { fullName: "", line1: "", line2: "", city: "", postcode: "", phone: "" };

type Phase = "identity" | "address" | "delivery" | "payment" | "review" | "processing" | "failed";

const PROVIDER = { stripe: "STRIPE", paypal: "PAYPAL" } as const;
const PROVIDER_LABEL = { stripe: "Stripe", paypal: "PayPal" } as const;
// The provider sends the customer back to /checkout?<provider>Attempt=<id>; the order
// (already created, so the cart is empty by then) is kept here across the redirect.
const RETURN_KEY = CHECKOUT_RETURN_KEY;
const CHECKOUT_KEY = "buildivo.checkoutIdempotencyKey";
type SavedCheckout = { order: PlacedOrder; email: string; method: PaymentMethodId; attemptId?: string };

function readSavedCheckout(): SavedCheckout | null {
  try { return JSON.parse(sessionStorage.getItem(RETURN_KEY) ?? "null"); } catch { return null; }
}

function saveCheckout(checkout: SavedCheckout): boolean {
  try { sessionStorage.setItem(RETURN_KEY, JSON.stringify(checkout)); return true; } catch { return false; }
}

function checkoutIdempotencyKey(): string {
  const existing = sessionStorage.getItem(CHECKOUT_KEY);
  if (existing) return existing;
  const key = crypto.randomUUID();
  sessionStorage.setItem(CHECKOUT_KEY, key);
  return key;
}

export default function CheckoutPage() {
  const { activeLines, payable, coupon, freeShippingCoupon } = useCartTotals();
  const commitOrder = useCartStore((s) => s.commitOrder);
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>("identity");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState<Address>(emptyAddress);
  const [shippingMethodId, setShippingMethodId] = useState<number | null>(null);
  const [deliveryNote, setDeliveryNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>("stripe");
  const [shippingQuotes, setShippingQuotes] = useState<ShippingQuote[] | null>(null);
  const [order, setOrder] = useState<PlacedOrder | null>(null);
  const [failReason, setFailReason] = useState("");
  const [stage, setStage] = useState<"starting" | "confirming">("starting");
  const [recoveryReady, setRecoveryReady] = useState(false);
  const starting = useRef(false);
  const paymentRequested = useRef(false);

  // Real delivery methods and prices from the API; the cheapest is pre-selected.
  useEffect(() => {
    fetchShippingQuotes()
      .then((quotes) => {
        setShippingQuotes(quotes);
        setShippingMethodId((current) => current ?? [...quotes].sort((a, b) => a.rate - b.rate)[0]?.id ?? null);
      })
      .catch(() => setShippingQuotes([]));
  }, []);

  const selectedShipping = shippingQuotes?.find((quote) => quote.id === shippingMethodId);
  const deliveryCharge = selectedShipping ? (freeShippingCoupon ? 0 : selectedShipping.rate) : 0;
  // Same rule the API applies to the order: goods - coupon + delivery.
  const total = Math.round((payable + deliveryCharge) * 100) / 100;

  function finishOrder(placed: PlacedOrder) {
    try {
      sessionStorage.setItem("buildivo.lastOrderReceipt", JSON.stringify({
        orderNumber: placed.orderNumber,
        uuid: placed.uuid,
        subtotal: Number(placed.subtotal),
        vatTotal: Number(placed.vatTotal),
        shippingCharge: Number(placed.shippingCharge),
        total: Number(placed.total),
        items: placed.items.map((item) => ({ title: item.titleSnapshot, variantTitle: item.variantTitleSnapshot, quantity: item.quantity, subtotal: Number(item.subtotal) })),
      }));
      sessionStorage.removeItem(RETURN_KEY);
      sessionStorage.removeItem(CHECKOUT_KEY);
    } catch { /* the confirmation still works for this in-memory session */ }
    commitOrder({
      orderNumber: placed.orderNumber,
      uuid: placed.uuid,
      subtotal: Number(placed.subtotal),
      vatTotal: Number(placed.vatTotal),
      shippingCharge: Number(placed.shippingCharge),
      total: Number(placed.total),
      items: placed.items.map((item) => ({ title: item.titleSnapshot, variantTitle: item.variantTitleSnapshot, quantity: item.quantity, subtotal: Number(item.subtotal) })),
    });
    router.replace(`/order-confirmation/${placed.orderNumber}`);
  }

  async function startPayment() {
    try {
      let current = order;
      if (!current) {
        if (!shippingMethodId) throw new Error("No delivery methods are available right now.");
        current = await placeOrderApi({
          email,
          shippingAddress: { fullName: address.fullName, line1: address.line1, line2: address.line2 || undefined, city: address.city, postcode: address.postcode, phone: address.phone },
          shippingMethodId,
          couponCode: coupon?.code,
          customerNote: deliveryNote.trim() || undefined,
        }, checkoutIdempotencyKey());
        setOrder(current);
      }
      const pending = readSavedCheckout();
      if (pending?.order.uuid === current.uuid && pending.attemptId) {
        const previousAttempt = await capturePaymentAttempt(pending.attemptId, email);
        if (previousAttempt.status === "CAPTURED") {
          finishOrder(current);
          return;
        }
        if (!["FAILED", "DECLINED", "CANCELLED", "EXPIRED"].includes(previousAttempt.status)) {
          throw new Error("Your previous payment is still being confirmed. Please wait a moment before retrying.");
        }
        saveCheckout({ ...pending, attemptId: undefined });
      }
      if (!saveCheckout({ order: current, email, method: paymentMethod })) {
        throw new Error("Your order is saved, but this browser could not save payment recovery details. Please contact support before leaving checkout.");
      }
      const attempt = await createPaymentAttempt({ orderUuid: current.uuid, email, provider: PROVIDER[paymentMethod] });
      if (!attempt.redirectUrl) throw new Error("No payment page was returned.");
      if (!saveCheckout({ order: current, email, method: paymentMethod, attemptId: attempt.attemptId })) {
        throw new Error("The payment page is ready, but this browser could not save recovery details. Please contact support before continuing.");
      }
      window.location.href = attempt.redirectUrl;
    } catch (error) {
      paymentRequested.current = false;
      console.error("Payment could not be started:", error);
      setFailReason(error instanceof Error ? error.message : "We couldn't start the payment.");
      setPhase("failed");
    }
  }

  function requestPayment() {
    if (paymentRequested.current) return;
    paymentRequested.current = true;
    setStage("starting");
    setPhase("processing");
  }

  // Restore the pending order after a refresh, and confirm provider returns against the API.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const attemptId = params.get("stripeAttempt") ?? params.get("paypalAttempt");
    const cancelled = params.has("stripeCancelled") || params.has("paypalCancelled");
    const saved = readSavedCheckout();
    if (!attemptId && !saved) {
      setRecoveryReady(true);
      return;
    }
    if (attemptId) window.history.replaceState(null, "", "/checkout");
    if (!saved) {
      setFailReason("We couldn't confirm your payment. If you were charged, please contact us with your order reference.");
      setPhase("failed");
      setRecoveryReady(true);
      return;
    }
    setOrder(saved.order); setEmail(saved.email); setPaymentMethod(saved.method);
    if (attemptId && saved.attemptId && saved.attemptId !== attemptId) {
      setFailReason("This payment return does not match the saved order. Please retry payment or contact support.");
      setPhase("failed");
      setRecoveryReady(true);
      return;
    }
    if (cancelled) {
      saveCheckout({ ...saved, attemptId: undefined });
      setFailReason("You cancelled the payment.");
      setPhase("failed");
      setRecoveryReady(true);
      return;
    }
    const attemptToConfirm = attemptId ?? saved.attemptId;
    if (!attemptToConfirm) {
      setFailReason("Your order is saved and payment is still pending. You can retry payment below.");
      setPhase("failed");
      setRecoveryReady(true);
      return;
    }
    setStage("confirming"); setPhase("processing");
    capturePaymentAttempt(attemptToConfirm, saved.email)
      .then((result) => {
        if (result.status === "CAPTURED") finishOrder(saved.order);
        else {
          saveCheckout({ ...saved, attemptId: undefined });
          setFailReason(result.error?.message || "The payment could not be completed.");
          setPhase("failed");
        }
      })
      .catch(() => { setFailReason("We couldn't confirm your payment. If you were charged, please contact us with your order reference."); setPhase("failed"); })
      .finally(() => setRecoveryReady(true));
    // runs once on mount: the attempt id comes from the URL, which is cleared above
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Entering "processing" from the review step: create the order (once), then the payment, then redirect.
  useEffect(() => {
    if (phase !== "processing" || stage !== "starting" || starting.current) return;
    starting.current = true;
    void startPayment().finally(() => { starting.current = false; });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, stage]);

  const stepNumber: Record<Phase, number> = {
    identity: 1,
    address: 2,
    delivery: 3,
    payment: 4,
    review: 5,
    processing: 5,
    failed: 5,
  };

  if (!recoveryReady) {
    return <p role="status" className="mx-auto max-w-xl px-4 py-24 text-center text-body-md font-body-md text-text-secondary">Restoring your checkout…</p>;
  }

  if (activeLines.length === 0 && !order && phase !== "processing" && phase !== "failed") {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
        <span aria-hidden className="material-symbols-outlined text-[56px] text-graphite-200">
          shopping_bag
        </span>
        <h1 className="text-headline-md font-headline-md font-bold text-graphite-900">There&apos;s nothing to check out yet</h1>
        <Button asChild className="bg-orange-500 hover:bg-orange-600">
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-4 sm:px-margin-desktop">
      {phase !== "processing" && phase !== "failed" && <CheckoutStepper current={stepNumber[phase]} />}

      <div className={phase === "processing" || phase === "failed" ? "" : "grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]"}>
        <div>
          {phase === "identity" && (
            <StepIdentity
              email={email}
              onContinue={(value) => {
                setEmail(value);
                setPhase("address");
              }}
            />
          )}

          {phase === "address" && (
            <StepAddress
              onBack={() => setPhase("identity")}
              onContinue={(value) => {
                setAddress(value);
                setPhase("delivery");
              }}
            />
          )}

          {phase === "delivery" && (
            <StepDelivery
              address={address}
              quotes={shippingQuotes}
              value={shippingMethodId}
              onChange={setShippingMethodId}
              note={deliveryNote}
              onNoteChange={setDeliveryNote}
              onBack={() => setPhase("address")}
              onContinue={() => setPhase("payment")}
            />
          )}

          {phase === "payment" && (
            <StepPayment
              onBack={() => setPhase("delivery")}
              onContinue={(method) => {
                setPaymentMethod(method);
                setPhase("review");
              }}
            />
          )}

          {phase === "review" && selectedShipping && (
            <StepReview
              email={email}
              address={address}
              shipping={selectedShipping}
              deliveryCharge={deliveryCharge}
              paymentMethod={paymentMethod}
              total={total}
              onBack={() => setPhase("payment")}
              onEdit={(step) => setPhase((["identity", "address", "delivery", "payment"] as const)[step - 1])}
              onPlaceOrder={requestPayment}
            />
          )}

          {phase === "processing" && (
            <StepProcessing total={order ? Number(order.total) : total} stage={stage} providerLabel={PROVIDER_LABEL[paymentMethod]} />
          )}

          {phase === "failed" && (
            <StepFailed
              total={order ? Number(order.total) : total}
              reason={failReason}
              orderPlaced={order !== null}
              onRetry={requestPayment}
              onChangeMethod={() => setPhase("payment")}
            />
          )}
        </div>

        {phase !== "processing" && phase !== "failed" && <CheckoutOrderSummary shipping={selectedShipping} showItems={phase !== "delivery"} className="h-fit" />}
      </div>
    </div>
  );
}
