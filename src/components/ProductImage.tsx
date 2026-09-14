import Image from "next/image";

/**
 * Renders a product's `image` field, which is either a real photo path
 * (starts with "/", e.g. "/products/mangga.jpg") or a plain emoji string
 * (used by a few legacy/reward records). Picks the right rendering for
 * either case so callers don't have to.
 */
export function ProductImage({
  image,
  alt,
  className = "",
  emojiClassName = "text-5xl",
}: {
  image: string;
  alt: string;
  className?: string;
  emojiClassName?: string;
}) {
  if (image.startsWith("/")) {
    return (
      <Image
        src={image}
        alt={alt}
        fill
        sizes="(max-width: 768px) 50vw, 25vw"
        className={`object-cover ${className}`}
      />
    );
  }
  return <span className={emojiClassName}>{image}</span>;
}
