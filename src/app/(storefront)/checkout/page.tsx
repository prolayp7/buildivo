"use client";

import { useEffect, useState } from "react";
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
import { applyCoupon, DEFAULT_CHECKOUT_COUPON } from "@/lib/checkout";
import { fetchShippingQuotes, placeOrder as placeOrderApi, type ShippingQuote } from "@/lib/storefront-client";
import type { Address, DeliveryMethodId } from "@/types";

const emptyAddress: Address = { fullName: "", line1: "", line2: "", city: "", postcode: "", phone: "" };

// Maps this design's illustrative delivery-method cards onto a real
// shipping-method quote from the API (standard = cheapest, express/saturday =
// the fastest one, click-collect = whichever has no carrier cost). The cards
// themselves stay exactly as designed; only the actual order submission
// needs a real, numeric shippingMethodId.
function pickShippingMethodId(method: DeliveryMethodId, quotes: ShippingQuote[]): number | undefined {
  if (!quotes.length) return undefined;
  const sorted = [...quotes].sort((a, b) => a.price - b.price);
  if (method === "express" || method === "saturday") return sorted[sorted.length - 1].id;
  return sorted[0].id;
}

type Phase = "identity" | "address" | "delivery" | "payment" | "review" | "processing" | "failed";

export default function CheckoutPage() {
  const { activeLines, subtotal } = useCartTotals();
  const total = applyCoupon(subtotal, DEFAULT_CHECKOUT_COUPON);
  const commitOrder = useCartStore((s) => s.commitOrder);
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>("identity");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState<Address>(emptyAddress);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethodId>("standard");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>("card");
  const [shippingQuotes, setShippingQuotes] = useState<ShippingQuote[]>([]);

  useEffect(() => {
    fetchShippingQuotes().then(setShippingQuotes).catch(() => setShippingQuotes([]));
  }, []);

  const stepNumber: Record<Phase, number> = {
    identity: 1,
    address: 2,
    delivery: 3,
    payment: 4,
    review: 5,
    processing: 5,
    failed: 5,
  };

  if (activeLines.length === 0) {
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

  async function placeOrder() {
    try {
      const shippingMethodId = pickShippingMethodId(deliveryMethod, shippingQuotes);
      if (!shippingMethodId) throw new Error("No delivery methods are available right now.");
      const order = await placeOrderApi({
        email,
        shippingAddress: { fullName: address.fullName, line1: address.line1, line2: address.line2 || undefined, city: address.city, postcode: address.postcode, phone: address.phone },
        shippingMethodId,
      });
      commitOrder({
        orderNumber: order.orderNumber,
        uuid: order.uuid,
        subtotal: Number(order.subtotal),
        vatTotal: Number(order.vatTotal),
        shippingCharge: Number(order.shippingCharge),
        total: Number(order.total),
        items: order.items.map((item) => ({ title: item.titleSnapshot, variantTitle: item.variantTitleSnapshot, quantity: item.quantity, subtotal: Number(item.subtotal) })),
      });
      router.push(`/order-confirmation/${order.orderNumber}`);
    } catch (error) {
      console.error("Order could not be placed:", error);
      setPhase("failed");
    }
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
              value={deliveryMethod}
              onChange={setDeliveryMethod}
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

          {phase === "review" && (
            <StepReview
              email={email}
              address={address}
              deliveryMethod={deliveryMethod}
              paymentMethod={paymentMethod}
              total={total}
              onBack={() => setPhase("payment")}
              onEdit={(step) => setPhase((["identity", "address", "delivery", "payment"] as const)[step - 1])}
              onPlaceOrder={() => setPhase("processing")}
            />
          )}

          {phase === "processing" && (
            <StepProcessing total={total} onSuccess={placeOrder} onDeclined={() => setPhase("failed")} />
          )}

          {phase === "failed" && (
            <StepFailed
              total={total}
              onRetry={() => setPhase("processing")}
              onChangeMethod={() => setPhase("payment")}
              onTradeBypass={placeOrder}
            />
          )}
        </div>

        {phase !== "processing" && phase !== "failed" && <CheckoutOrderSummary showItems={phase !== "delivery"} className="h-fit" />}
      </div>
    </div>
  );
}
