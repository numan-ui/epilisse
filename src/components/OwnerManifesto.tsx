'use client';

import { useAdminLandingContent } from '@/hooks/useAdminLandingContent';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import { useAdminAboutValues } from '@/hooks/useAdminAboutValues';
import { INIT_LANDING_CONTENT } from '@/app/[locale]/admin/behandlungen/data';
import SmartImage from '@/components/SmartImage';

/** Empty admin field → fall back to the seeded default, never render blank. */
const str = (v: string | undefined, fb: string) => (v && v.trim() !== '' ? v : fb);

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? 'E') + (parts[1]?.[0] ?? '')).toUpperCase();
}

/**
 * First-person owner manifesto: circular portrait + name/role beside a kicker,
 * serif title, body, and the credential ✓ cards (reused `aboutValues`).
 * Rendered in the homepage "Über Uns" section and near the top of /ueber-uns.
 */
export default function OwnerManifesto({ className = '' }: { className?: string }) {
  const lc = useAdminLandingContent();
  const s = useAdminSettings();
  const values = useAdminAboutValues();

  const kicker = str(lc.ownerKicker, INIT_LANDING_CONTENT.ownerKicker);
  const title = str(lc.ownerTitle, INIT_LANDING_CONTENT.ownerTitle);
  const body = str(lc.ownerBody, INIT_LANDING_CONTENT.ownerBody);
  const name = str(lc.ownerName, INIT_LANDING_CONTENT.ownerName);
  const role = str(lc.ownerRole, INIT_LANDING_CONTENT.ownerRole);

  return (
    <div className={`grid grid-cols-1 md:grid-cols-[minmax(0,320px)_1fr] gap-12 md:gap-16 items-start ${className}`}>
      {/* Portrait + identity */}
      <div className="flex flex-col items-center md:items-start gap-5">
        <div className="relative w-52 h-52 md:w-full md:h-auto md:aspect-square rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
          {s.ownerImage ? (
            <SmartImage
              src={s.ownerImage}
              alt={name}
              className="object-cover"
              sizes="(min-width: 768px) 320px, 208px"
            />
          ) : (
            <span className="font-display-lg text-[60px] text-primary/40">{initials(name)}</span>
          )}
        </div>
        <div className="text-center md:text-left">
          <p className="font-display-lg text-[20px] text-on-surface">{name}</p>
          <p className="font-label-caps text-[11px] tracking-wider text-primary uppercase mt-1">{role}</p>
        </div>
      </div>

      {/* Copy + credentials */}
      <div>
        <span className="font-label-caps text-label-caps text-primary tracking-[0.2em] block mb-3">
          {kicker}
        </span>
        <h2 className="font-display-lg text-headline-lg font-semibold text-on-surface mb-6 leading-tight text-balance">
          {title}
        </h2>
        <p className="font-body-lg text-body-lg text-secondary mb-10 whitespace-pre-line">
          {body}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {values.map((v) => (
            <div
              key={v.id}
              className="flex gap-3 items-start border border-outline-variant/30 rounded-xl p-4 bg-surface-container-lowest"
            >
              <span
                className="material-symbols-outlined text-primary text-[20px] mt-0.5 shrink-0"
                style={{ fontVariationSettings: "'FILL' 1" }}
                aria-hidden
              >
                check_circle
              </span>
              <div>
                <h3 className="font-headline-sm text-[15px] font-medium text-on-surface mb-0.5">
                  {v.title}
                </h3>
                {v.desc && <p className="font-body-sm text-body-sm text-secondary">{v.desc}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
