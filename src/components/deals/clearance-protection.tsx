import { BadgeCheck, ClipboardPlus, ShieldCheck, Truck } from "lucide-react";
import type { DealsPageContent } from "@/lib/api";
import styles from "./clearance-protection.module.css";

const ICONS = [BadgeCheck, ClipboardPlus, Truck];

export function ClearanceProtection({ content }: { content: DealsPageContent["clearance"] }) {
  return (
    <section className={styles.section} aria-labelledby="clearance-protection-heading">
      <div className={styles.container}>
        <header className={styles.header}>
          <p><ShieldCheck aria-hidden="true" />{content.kicker}</p>
          <h2 id="clearance-protection-heading">{content.heading}</h2>
        </header>
        <div className={styles.grid}>
          {content.items.map(({ title, description }, index) => {
            const Icon = ICONS[index % ICONS.length];
            return (
              <article key={`${title}-${index}`} className={styles.card}>
                <span className={styles.icon}><Icon aria-hidden="true" strokeWidth={1.8} /></span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
