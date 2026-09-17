import { BadgeCheck, ClipboardPlus, ShieldCheck, Store, Truck } from "lucide-react";
import styles from "./clearance-protection.module.css";

const protections = [
  {
    icon: BadgeCheck,
    title: "100% Genuine OEM Warranty",
    description: "Every clearance item carries the original manufacturer warranty (1 to 3 years) from approved brand distributors.",
  },
  {
    icon: ClipboardPlus,
    title: "30-Day Jobsite Returns",
    description: "Surplus clearance units unopened in original packaging can be returned with free courier pickup or depot drop-off.",
  },
  {
    icon: Store,
    title: "30-Min Click & Collect",
    description: "Reserve clearance items online for immediate collection across our 48 regional distribution branches nationwide.",
  },
  {
    icon: Truck,
    title: "Next-Day UK Site Delivery",
    description: "Order before 18:00 for guaranteed next-working-day parcel dispatch or tracked pallet logistics.",
  },
];

export function ClearanceProtection() {
  return (
    <section className={styles.section} aria-labelledby="clearance-protection-heading">
      <div className={styles.container}>
        <header className={styles.header}>
          <p><ShieldCheck aria-hidden="true" />BUILDIVO PRO PROTECTION STANDARDS</p>
          <h2 id="clearance-protection-heading">Trade Peace of Mind on All Clearance Stock</h2>
        </header>
        <div className={styles.grid}>
          {protections.map(({ icon: Icon, title, description }) => (
            <article key={title} className={styles.card}>
              <span className={styles.icon}><Icon aria-hidden="true" strokeWidth={1.8} /></span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
