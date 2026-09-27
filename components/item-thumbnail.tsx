type Props = {
  imageUrl?: string | null;
  alt: string;
  color: string;
  monogram: string;
  /** Tailwind size classes, e.g. "size-16 sm:size-20". */
  className?: string;
};

/**
 * Small square product thumbnail. Until Amazon image access is unlocked most
 * items have no image_url, so the fallback is a deliberate design element -
 * a glowing tile in the sector's own colour with a neon monogram - rather
 * than a grey "missing image" box.
 */
export function ItemThumbnail({
  imageUrl,
  alt,
  color,
  monogram,
  className = "size-16 sm:size-20",
}: Props) {
  const frame = {
    border: `1px solid ${color}88`,
    boxShadow: `0 0 18px ${color}55, inset 0 1px 0 ${color}44`,
  };

  if (imageUrl) {
    return (
      <div
        className={`${className} shrink-0 rounded-2xl overflow-hidden bg-white`}
        style={frame}
      >
        {/* Plain <img>: product images come from external retailer CDNs,
            and next/image would need every host whitelisted in config. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={alt}
          loading="lazy"
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`${className} shrink-0 rounded-2xl flex items-center justify-center`}
      style={{
        ...frame,
        background: `radial-gradient(circle at 30% 25%, ${color}55, ${color}14 70%), #05050a`,
      }}
    >
      <span
        className="font-black tracking-wider text-sm sm:text-base"
        style={{ color, textShadow: `0 0 10px ${color}, 0 0 22px ${color}88` }}
      >
        {monogram}
      </span>
    </div>
  );
}
