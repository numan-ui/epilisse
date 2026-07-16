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
  if (src.startsWith("/")) {
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

  // Admin-uploaded images are base64 data URLs (FileReader.readAsDataURL), which land here since
  // they don't start with "/". Unlike next/image's `fill`, a bare <img> has no intrinsic sizing —
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
