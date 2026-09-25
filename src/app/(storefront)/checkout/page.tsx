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
import { capturePaymentAttempt, createPaymentAttempt } from "@/lib/payments";
import type { Address } from "@/types";

const emptyAddress: Address = { fullName: "", line1: "", line2: "", city: "", postcode: "", phone: "" };

type Phase = "identity" | "address" | "delivery" | "payment" | "review" | "processing" | "failed";

const PROVIDER = { stripe: "STRIPE", paypal: "PAYPAL" } as const;
const PROVIDER_LABEL = { stripe: "Stripe", paypal: "PayPal" } as const;
// The provider sends the customer back to /checkout?<provider>Attempt=<id>; the order
// (already created, so the cart is empty by then) is kept here across the redirect.
const RETURN_KEY = "buildivo.checkoutReturn";
type SavedCheckout = { order: PlacedOrder; email: string; method: PaymentMethodId };

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
  // one key per checkout visit: a double click or retry returns the same order
  const checkoutKey = useRef(crypto.randomUUID());
  const starting = useRef(false);

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
    sessionStorage.removeItem(RETURN_KEY);
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
        }, checkoutKey.current);
        setOrder(current);
      }
      const attempt = await createPaymentAttempt({ orderUuid: current.uuid, email, provider: PROVIDER[paymentMethod] });
      if (!attempt.redirectUrl) throw new Error("No payment page was returned.");
      sessionStorage.setItem(RETURN_KEY, JSON.stringify({ order: current, email, method: paymentMethod } satisfies SavedCheckout));
      window.location.href = attempt.redirectUrl;
    } catch (error) {
      console.error("Payment could not be started:", error);
      setFailReason(error instanceof Error ? error.message : "We couldn't start the payment.");
      setPhase("failed");
    }
  }

  // Back from Stripe/PayPal: confirm the payment with the API (the webhook is only a safety net).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const attemptId = params.get("stripeAttempt") ?? params.get("paypalAttempt");
    if (!attemptId) return;
    const cancelled = params.has("stripeCancelled") || params.has("paypalCancelled");
    let saved: SavedCheckout | null = null;
    try { saved = JSON.parse(sessionStorage.getItem(RETURN_KEY) ?? "null"); } catch { saved = null; }
    window.history.replaceState(null, "", "/checkout");
    if (!saved) {
      setFailReason("We couldn't confirm your payment. If you were charged, please contact us with your order reference.");
      setPhase("failed");
      return;
    }
    setOrder(saved.order); setEmail(saved.email); setPaymentMethod(saved.method);
    if (cancelled) { setFailReason("You cancelled the payment."); setPhase("failed"); return; }
    setStage("confirming"); setPhase("processing");
    capturePaymentAttempt(attemptId, saved.email)
      .then((result) => {
        if (result.status === "CAPTURED") finishOrder(saved.order);
        else { setFailReason(result.error?.message || "The payment could not be completed."); setPhase("failed"); }
      })
      .catch(() => { setFailReason("We couldn't confirm your payment. If you were charged, please contact us with your order reference."); setPhase("failed"); });
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
              onPlaceOrder={() => { setStage("starting"); setPhase("processing"); }}
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
              onRetry={() => { setStage("starting"); setPhase("processing"); }}
              onChangeMethod={() => setPhase("payment")}
            />
          )}
        </div>

        {phase !== "processing" && phase !== "failed" && <CheckoutOrderSummary shipping={selectedShipping} showItems={phase !== "delivery"} className="h-fit" />}
      </div>
    </div>
  );
}
