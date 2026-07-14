'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';

type Recipient = {
  id: string;
  status: 'pending' | 'sent' | 'failed';
  error: string | null;
  customers: { name: string; email: string } | null;
};

type CampaignDetail = {
  id: string;
  name: string | null;
  title: string;
  message: string;
  discount_label: string | null;
  target_type: 'all' | 'category' | 'customers';
  status: 'draft' | 'sending' | 'sent' | 'failed';
  created_at: string;
  sent_at: string | null;
  recipients: Recipient[];
};

const STATUS_LABEL: Record<Recipient['status'], string> = {
  sent: 'Gesendet',
  failed: 'Fehlgeschlagen',
  pending: 'Ausstehend',
};

export default function KampagneDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || 'de';
  const id = params?.id as string;

  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [loading, setLoading]   = useState(true);
  const [query, setQuery]       = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Recipient['status']>('all');
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft]     = useState('');
  const [saving, setSaving]     = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/campaigns/${id}`).then(r => r.json()).then(setCampaign).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const saveName = async () => {
    setSaving(true);
    try {
      await fetch(`/api/campaigns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameDraft || null }),
      });
      load();
      setEditingName(false);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !campaign) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="font-body-sm text-outline">Lädt…</p>
      </div>
    );
  }

  const filteredRecipients = campaign.recipients.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (r.customers?.name ?? '').toLowerCase().includes(q) || (r.customers?.email ?? '').toLowerCase().includes(q);
  });

  const counts = campaign.recipients.reduce(
    (acc, r) => { acc[r.status]++; return acc; },
    { sent: 0, failed: 0, pending: 0 } as Record<Recipient['status'], number>
  );

  return (
    <>
      <header className="h-20 border-b border-outline-variant/30 flex items-center gap-4 px-8 bg-surface/80 backdrop-blur-md shrink-0">
        <button
          onClick={() => router.push(`/${locale}/admin/kampagnen`)}
          className="text-outline hover:text-primary transition-colors"
          aria-label="Zurück"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex-1 min-w-0">
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveName()}
                placeholder="z.B. Sommerfest, Weihnachten Rabatt"
                className="font-headline-md text-headline-md text-on-surface bg-transparent border-b border-primary focus:outline-none"
              />
              <button onClick={saveName} disabled={saving} className="text-primary hover:brightness-110">
                <span className="material-symbols-outlined text-[20px]">check</span>
              </button>
              <button onClick={() => setEditingName(false)} className="text-outline hover:text-error">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <h2 className="font-headline-md text-headline-md text-on-surface truncate">{campaign.name || campaign.title}</h2>
              <button
                onClick={() => { setNameDraft(campaign.name ?? ''); setEditingName(true); }}
                className="text-outline opacity-0 group-hover:opacity-100 hover:text-primary transition-all"
                title="Kampagnenname bearbeiten"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </button>
            </div>
          )}
          <p className="font-body-sm text-secondary truncate">Betreff: {campaign.title}</p>
        </div>
        <span className={`font-label-caps text-[10px] px-2 py-0.5 shrink-0 ${
          campaign.status === 'sent' ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-outline'
        }`}>
          {campaign.status === 'sent' ? 'Gesendet' : campaign.status === 'sending' ? 'Tageslimit erreicht' : 'Entwurf'}
        </span>
      </header>

      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        <div className="bg-surface-container-lowest border border-outline-variant p-5 space-y-2">
          <p className="font-body-sm text-on-surface-variant">{campaign.message}</p>
          <div className="flex items-center gap-4 pt-1 font-label-caps text-[10px] text-outline">
            <span>{counts.sent} gesendet</span>
            {counts.failed > 0 && <span>{counts.failed} fehlgeschlagen</span>}
            {counts.pending > 0 && <span>{counts.pending} ausstehend</span>}
            {campaign.sent_at && <span>{new Date(campaign.sent_at).toLocaleString('de-DE')}</span>}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Kundin suchen (Name oder E-Mail)…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 min-w-[220px] border-b border-outline-variant bg-transparent py-2 font-body-md text-on-surface focus:border-primary focus:outline-none transition-all"
          />
          <div className="flex gap-1">
            {([['all', 'Alle'], ['sent', 'Gesendet'], ['failed', 'Fehlgeschlagen'], ['pending', 'Ausstehend']] as const).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setStatusFilter(val)}
                className={`font-label-caps text-[10px] px-3 py-1.5 transition-all ${
                  statusFilter === val
                    ? 'bg-primary text-on-primary'
                    : 'border border-outline-variant text-on-surface-variant hover:border-primary/50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant divide-y divide-outline-variant/30">
          {filteredRecipients.length === 0 ? (
            <p className="p-5 font-body-sm text-outline text-center">Keine Empfängerinnen gefunden.</p>
          ) : (
            filteredRecipients.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-5 py-3">
                <div className="min-w-0">
                  <p className="font-body-md text-on-surface truncate">{r.customers?.name ?? '—'}</p>
                  <p className="font-body-sm text-secondary truncate">{r.customers?.email}</p>
                </div>
                <span
                  className={`font-label-caps text-[10px] px-2 py-0.5 shrink-0 ${
                    r.status === 'sent' ? 'bg-primary/10 text-primary' :
                    r.status === 'failed' ? 'bg-error/10 text-error' :
                    'bg-surface-container-high text-outline'
                  }`}
                  title={r.error ?? undefined}
                >
                  {STATUS_LABEL[r.status]}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
