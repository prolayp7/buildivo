import { BadgeCheck, ClipboardPlus, ShieldCheck, Truck } from "lucide-react";
import styles from "./clearance-protection.module.css";

const protections = [
  {
    icon: BadgeCheck,
    title: "Manufacturer warranty details",
    description: "Coverage and exclusions vary by product. Check the product details for applicable manufacturer terms.",
  },
  {
    icon: ClipboardPlus,
    title: "Item-specific return eligibility",
    description: "Eligible delivered items show their return window in your account. Conditions vary by item.",
  },
  {
    icon: Truck,
    title: "Delivery options at checkout",
    description: "Available delivery methods and charges are shown before payment. Tracking appears when carrier details are available.",
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
