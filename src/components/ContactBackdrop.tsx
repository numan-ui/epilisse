import Image from 'next/image';

/**
 * Photo + dark overlay behind the homepage "Kontakt & Standort" section.
 * Below the fold, so the photo is lazy-loaded and never competes with LCP.
 * Deliberately static: the glass cards above blur it, and a moving backdrop
 * would force that blur to re-render every frame.
 */
export default function ContactBackdrop({ src }: { src: string }) {
  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden bg-inverse-surface">
      <Image src={src} alt="" fill sizes="100vw" quality={70} loading="lazy" className="object-cover object-center" />
      {/* Even tint keeps text legible; the photo stays as texture for the glass to blur. */}
      <div className="absolute inset-0 bg-inverse-surface/55" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,color-mix(in_srgb,var(--color-inverse-surface)_70%,transparent)_100%)]" />
    </div>
  );
}
