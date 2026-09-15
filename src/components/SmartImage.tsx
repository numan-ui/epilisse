import Image from "next/image";

/**
 * Admin-editable image slots can hold either our local default (`/images/...`,
 * safe to run through next/image optimization) or an arbitrary external URL an
 * admin pasted in (host not known ahead of time, so next/image would throw
 * without a matching remotePatterns entry). Branch on that instead of forcing
 * every possible admin host into next.config.
 */
export default function SmartImage({
  src,
  alt,
  className,
  style,
  sizes,
  priority,
  onError,
}: {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  sizes?: string;
  priority?: boolean;
  onError?: React.ReactEventHandler<HTMLImageElement>;
}) {
  // Local assets (`/images/...`) and Supabase Storage URLs both go through
  // next/image — the storage host is whitelisted in next.config.ts
  // (images.remotePatterns), so these get resized/re-encoded (WebP/AVIF)
  // instead of shipping the admin's original upload at full resolution.
  if (src.startsWith("/") || src.includes("supabase.co/storage/")) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes ?? "100vw"}
        priority={priority}
        className={className}
        style={style}
        onError={onError}
      />
    );
  }

  // Admin-uploaded images can still be base64 data URLs (FileReader.readAsDataURL) from
  // before the storage-upload migration — those land here since they're not a URL
  // next/image can optimize. Unlike next/image's `fill`, a bare <img> has no intrinsic sizing —
  // without explicit absolute/inset/w-full/h-full it renders at its natural pixel size instead of
  // filling the parent box, leaving the rest of the box showing whatever is behind it.
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={alt}
      className={`absolute inset-0 w-full h-full ${className ?? ""}`}
      style={style}
      onError={onError}
    />
  );
}
