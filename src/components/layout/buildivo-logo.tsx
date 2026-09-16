import Image from "next/image";

interface BuildivoLogoProps {
  /** Visible height in px of the cropped mark + wordmark (tagline and
   * surrounding clearspace from the source asset are cropped out below). */
  height?: number;
  className?: string;
}

const SOURCE_SIZE = 1254;
// Measured pixel bounds of the mark+wordmark block in the source square asset
// (icon starts ~212px, "Buildivo" wordmark ends ~933px; tagline starts ~974px,
// so cropping at 955px keeps a small gap without reaching the tagline). A
// little padding is kept above the icon (170px) instead of trimming to 212px
// so the mark isn't flush against the crop edge.
const CROP_TOP = 170;
const CROP_BOTTOM = 955;
const VISIBLE_FRACTION = (CROP_BOTTOM - CROP_TOP) / SOURCE_SIZE;
const TOP_OFFSET_FRACTION = CROP_TOP / SOURCE_SIZE / VISIBLE_FRACTION;

export function BuildivoLogo({ height = 56, className }: BuildivoLogoProps) {
  const renderSize = Math.round(height / VISIBLE_FRACTION);
  const translateY = -Math.round(TOP_OFFSET_FRACTION * height);
  return (
    <span className={className} style={{ height, width: renderSize, overflow: "hidden", display: "block" }}>
      <Image
        src="/images/buildivo.png"
        alt="Buildivo home"
        width={renderSize}
        height={renderSize}
        priority
        style={{ width: renderSize, height: renderSize, maxWidth: "none", transform: `translateY(${translateY}px)` }}
      />
    </span>
  );
}
