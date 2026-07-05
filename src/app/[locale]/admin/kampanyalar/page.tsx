'use client';
import { useEffect, useState, useCallback } from 'react';
import { CustomerPicker, type PickableCustomer } from '@/components/admin/CustomerPicker';

type TargetType = 'all' | 'category' | 'customers';

type Campaign = {
  id: string;
  title: string;
  message: string;
  discount_label: string | null;
  target_type: TargetType;
  target_category_id: string | null;
  targetCategoryName: string | null;
  status: 'draft' | 'sending' | 'sent' | 'failed';
  created_at: string;
  sent_at: string | null;
  recipientCounts: { total: number; sent: number; failed: number };
};

type Category = { id: string; name: string };

const EMPTY_DRAFT = {
  title: '',
  message: '',
  discountLabel: '',
  targetType: 'all' as TargetType,
  targetCategoryId: '',
  customerIds: [] as string[],
};

export default function KampanyalarPage() {
  const [campaigns, setCampaigns]   = useState<Campaign[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers]   = useState<PickableCustomer[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [draft, setDraft]           = useState(EMPTY_DRAFT);
  const [sending, setSending]       = useState(false);
  const [confirming, setConfirming] = useState(false);

  const loadCampaigns = useCallback(() => {
    setLoading(true);
    fetch('/api/campaigns').then(r => r.json()).then(setCampaigns).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadCampaigns();
    fetch('/api/categories').then(r => r.json()).then(setCategories);
    fetch('/api/customers').then(r => r.json()).then(setCustomers);
  }, [loadCampaigns]);

  const audienceLabel = (c: Campaign) => {
    if (c.target_type === 'all') return 'Alle Kundinnen';
    if (c.target_type === 'category') return `Kategorie: ${c.targetCategoryName ?? '—'}`;
    return `${c.recipientCounts.total} ausgewählte Kundinnen`;
  };

  const createAndSend = async () => {
    if (!draft.title.trim() || !draft.message.trim()) return;
    if (draft.targetType === 'category' && !draft.targetCategoryId) return;
    if (draft.targetType === 'customers' && draft.customerIds.length === 0) return;

    setSending(true);
    try {
      const createRes = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: draft.title,
          message: draft.message,
          discountLabel: draft.discountLabel || null,
          targetType: draft.targetType,
          targetCategoryId: draft.targetType === 'category' ? draft.targetCategoryId : undefined,
          customerIds: draft.targetType === 'customers' ? draft.customerIds : undefined,
        }),
      });
      const created = await createRes.json();
      await fetch(`/api/campaigns/${created.id}/send`, { method: 'POST' });
      loadCampaigns();
      setDraft(EMPTY_DRAFT);
      setShowCompose(false);
      setConfirming(false);
    } finally {
      setSending(false);
    }
  };

  const audienceSummary =
    draft.targetType === 'all' ? `alle ${customers.length} Kundinnen` :
    draft.targetType === 'category' ? `Kundinnen der Kategorie "${categories.find(c => c.id === draft.targetCategoryId)?.name ?? ''}"` :
    `${draft.customerIds.length} ausgewählte Kundin(nen)`;

  return (
    <>
      <header className="h-20 border-b border-outline-variant/30 flex items-center justify-between px-8 bg-surface/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="font-headline-md text-headline-md text-on-surface">Kampanyalar</h2>
          <span className="text-outline-variant">|</span>
          <p className="font-body-sm text-secondary">{campaigns.length} Kampagnen gesamt</p>
        </div>
        <button
          onClick={() => setShowCompose(true)}
          className="flex items-center gap-2 bg-primary text-on-primary py-2.5 px-5 font-label-caps text-label-caps hover:brightness-110 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">campaign</span>
          Neue Kampagne
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-8 space-y-3">
        {loading && <p className="text-center font-body-sm text-outline">Lädt…</p>}
        {!loading && campaigns.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-on-surface-variant opacity-50 gap-3">
            <span className="material-symbols-outlined text-5xl">campaign</span>
            <p className="font-body-sm">Noch keine Kampagnen gesendet.</p>
          </div>
        )}
        {campaigns.map((c) => (
          <div key={c.id} className="bg-surface-container-lowest border border-outline-variant p-5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                {c.discount_label && (
                  <span className="font-label-caps text-[10px] text-primary bg-primary/10 px-2 py-0.5">{c.discount_label}</span>
                )}
                <h4 className="font-headline-sm text-[15px] text-on-surface">{c.title}</h4>
              </div>
              <span className={`font-label-caps text-[10px] px-2 py-0.5 ${
                c.status === 'sent' ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-outline'
              }`}>
                {c.status === 'sent' ? 'Gesendet' : c.status === 'sending' ? 'Wird gesendet…' : 'Entwurf'}
              </span>
            </div>
            <p className="font-body-sm text-on-surface-variant">{c.message}</p>
            <div className="flex items-center gap-4 pt-1 font-label-caps text-[10px] text-outline">
              <span>{audienceLabel(c)}</span>
              {c.status === 'sent' && (
                <span>{c.recipientCounts.sent} gesendet{c.recipientCounts.failed > 0 ? `, ${c.recipientCounts.failed} fehlgeschlagen` : ''}</span>
              )}
              {c.sent_at && <span>{new Date(c.sent_at).toLocaleString('de-DE')}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* ── Compose modal ────────────────────────────────────── */}
      {showCompose && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => !sending && setShowCompose(false)}
        >
          <div
            className="bg-surface w-full max-w-lg border border-outline-variant shadow-2xl p-8 space-y-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Neue Kampagne</h3>
              <button onClick={() => setShowCompose(false)} className="text-outline hover:text-error transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="font-label-caps text-[10px] text-outline uppercase block mb-1">Zielgruppe</label>
                <div className="flex gap-1">
                  {([['all', 'Alle'], ['category', 'Nach Kategorie'], ['customers', 'Bestimmte Kundinnen']] as const).map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => setDraft(p => ({ ...p, targetType: val }))}
                      className={`font-label-caps text-[10px] px-3 py-1.5 transition-all ${
                        draft.targetType === val
                          ? 'bg-primary text-on-primary'
                          : 'border border-outline-variant text-on-surface-variant hover:border-primary/50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {draft.targetType === 'category' && (
                <div>
                  <label className="font-label-caps text-[10px] text-outline uppercase block mb-1">Kategorie</label>
                  <select
                    value={draft.targetCategoryId}
                    onChange={(e) => setDraft(p => ({ ...p, targetCategoryId: e.target.value }))}
                    className="w-full border-b border-outline-variant bg-transparent py-2 font-body-md text-on-surface focus:border-primary focus:outline-none transition-all"
                  >
                    <option value="">Wählen…</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}

              {draft.targetType === 'customers' && (
                <div>
                  <label className="font-label-caps text-[10px] text-outline uppercase block mb-1">Kundinnen</label>
                  <CustomerPicker
                    customers={customers}
                    value={draft.customerIds}
                    onChange={(ids) => setDraft(p => ({ ...p, customerIds: ids }))}
                    multiple
                  />
                </div>
              )}

              <div>
                <label className="font-label-caps text-[10px] text-outline uppercase block mb-1">Rabatt-Label (optional)</label>
                <input
                  type="text"
                  placeholder="z.B. 10% Rabatt"
                  value={draft.discountLabel}
                  onChange={(e) => setDraft(p => ({ ...p, discountLabel: e.target.value }))}
                  className="w-full border-b border-outline-variant bg-transparent py-2 font-body-md text-on-surface focus:border-primary focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="font-label-caps text-[10px] text-outline uppercase block mb-1">Titel</label>
                <input
                  type="text"
                  placeholder="z.B. 10% auf alle Laser-Behandlungen"
                  value={draft.title}
                  onChange={(e) => setDraft(p => ({ ...p, title: e.target.value }))}
                  className="w-full border-b border-outline-variant bg-transparent py-2 font-body-md text-on-surface focus:border-primary focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="font-label-caps text-[10px] text-outline uppercase block mb-1">Nachricht</label>
                <textarea
                  rows={4}
                  placeholder="Ihre Nachricht an die Kundinnen..."
                  value={draft.message}
                  onChange={(e) => setDraft(p => ({ ...p, message: e.target.value }))}
                  className="w-full border-b border-outline-variant bg-transparent py-2 font-body-sm text-on-surface focus:border-primary focus:outline-none resize-none transition-all"
                />
              </div>
            </div>

            {!confirming ? (
              <div className="flex gap-3 pt-2">
                <button
                  className="flex-1 bg-primary text-on-primary py-3 font-label-caps text-label-caps hover:brightness-110 transition-all"
                  onClick={() => setConfirming(true)}
                >
                  Weiter
                </button>
                <button
                  className="px-4 border border-outline-variant text-on-surface-variant hover:border-error hover:text-error transition-all font-label-caps text-label-caps"
                  onClick={() => setShowCompose(false)}
                >
                  Abbrechen
                </button>
              </div>
            ) : (
              <div className="space-y-3 pt-2 border-t border-outline-variant/30">
                <p className="font-body-sm text-on-surface-variant pt-3">
                  Diese Kampagne wird per E-Mail an <strong>{audienceSummary}</strong> gesendet. Dies kann nicht rückgängig gemacht werden.
                </p>
                <div className="flex gap-3">
                  <button
                    disabled={sending}
                    className="flex-1 bg-primary text-on-primary py-3 font-label-caps text-label-caps hover:brightness-110 transition-all disabled:opacity-50"
                    onClick={createAndSend}
                  >
                    {sending ? 'Wird gesendet…' : 'Jetzt senden'}
                  </button>
                  <button
                    disabled={sending}
                    className="px-4 border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-all font-label-caps text-label-caps"
                    onClick={() => setConfirming(false)}
                  >
                    Zurück
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
