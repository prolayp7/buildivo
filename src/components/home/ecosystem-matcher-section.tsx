import { BatteryMatcher } from "@/components/home/battery-matcher";
import type { EcosystemMatcherContent } from "@/components/home/ecosystem-matcher-content";
import type { ToolPlatform } from "@/lib/api";

export function EcosystemMatcherSection({ content, platforms }: { content: EcosystemMatcherContent; platforms: ToolPlatform[] }) {
  return (
    <section className="mx-auto w-full max-w-[1600px] px-4 pb-14 sm:px-margin-desktop">
      <BatteryMatcher content={content} platforms={platforms} />
    </section>
  );
}