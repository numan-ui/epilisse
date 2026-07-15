'use client';
import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PREVIEW_GRADIENT, FRONTEND_SLUG, type Service, type Campaign, type PageBanner, type ImagePosition } from '../data';
import { useAdminData } from '../AdminDataContext';

const EMPTY_SERVICE: Omit<Service, 'id'> = { name: '', price: '', duration: '', active: true };
const EMPTY_CAMPAIGN: Omit<Campaign, 'id'> = { label: '', title: '', desc: '', price: '', oldPrice: '', cta: 'JETZT BUCHEN', icon: 'auto_fix_high', image: '', imagePosition: 'top', active: true };

const BANNER_ICONS = ['auto_awesome', 'spa', 'diamond', 'loyalty', 'favorite', 'face_retouching_natural', 'health_and_beauty', 'self_improvement', 'fitness_center', 'card_membership', 'auto_fix_high', 'star'];

export default function CategoryDetailPage() {
  const params    = useParams();
  const router    = useRouter();
  const locale    = (params?.locale as string) || 'de';
  const catId     = params?.categoryId as string;

  const {
    services: allServices, campaigns: allCampaigns, pageContent: allPageContent,
    updateService: ctxUpdateService, deleteService: ctxDeleteService, addService: ctxAddService,
    updateCampaign: ctxUpdateCampaign, deleteCampaign: ctxDeleteCampaign, addCampaign: ctxAddCampaign,
    updatePageField, updatePageParagraph, updatePageBenefit, addPageBenefit, removePageBenefit, updatePageBanner,
    categories, updateCategory, deleteCategory,
  } = useAdminData();

  const category = categories.find((c) => c.id === catId);

  const services   = allServices[catId]   ?? [];
  const campaigns  = allCampaigns[catId]  ?? [];
  const pc         = allPageContent[catId];

  const [saved, setSaved]         = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [addSvcOpen, setAddSvcOpen] = useState(false);
  const [addCmpOpen, setAddCmpOpen] = useState(false);
  const [newSvc, setNewSvc]       = useState(EMPTY_SERVICE);
  const [newCmp, setNewCmp]       = useState(EMPTY_CAMPAIGN);
  const [contentOpen, setContentOpen] = useState(false);
  const [contentTab, setContentTab]   = useState<'hero' | 'info' | 'banners'>('hero');
  const svcNameRef = useRef<HTMLInputElement>(null);
  const catImgRef  = useRef<HTMLInputElement>(null);

  /* ── Service helpers ─────────────────────────────── */
  const updateService = (id: string, field: keyof Service, value: string | boolean) =>
    ctxUpdateService(catId, id, field, value);
  const deleteService = (id: string) => ctxDeleteService(catId, id);
  const addService = () => {
    if (!newSvc.name.trim()) { svcNameRef.current?.focus(); return; }
    ctxAddService(catId, newSvc);
    setNewSvc(EMPTY_SERVICE);
    setAddSvcOpen(false);
  };

  /* ── Campaign helpers ────────────────────────────── */
  const updateCampaign = (id: string, field: keyof Campaign, value: string | boolean) =>
    ctxUpdateCampaign(catId, id, field, value);
  const deleteCampaign = (id: string) => ctxDeleteCampaign(catId, id);
  const addCampaign = () => {
    if (!newCmp.title.trim()) return;
    ctxAddCampaign(catId, newCmp);
    setNewCmp(EMPTY_CAMPAIGN);
    setAddCmpOpen(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDeleteCategory = () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    deleteCategory(catId);
    router.push(`/${locale}/admin/behandlungen`);
  };

  if (!category) {
    return (
      <div className="flex-1 flex items-center justify-center text-on-surface-variant">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl block mb-4 text-outline">error</span>
          <p className="font-headline-sm">Kategorie nicht gefunden.</p>
          <Link href={`/${locale}/admin/behandlungen`} className="font-label-caps text-primary underline mt-4 block">
            Zurück zur Übersicht
          </Link>
        </div>
      </div>
    );
  }

  const activeCount = services.filter(s => s.active).length;

  return (
    <>
      {/* Top bar */}
      <header className="h-20 border-b border-outline-variant/30 flex items-center justify-between px-8 bg-surface/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}/admin/behandlungen`}
            className="flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors font-body-sm"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back_ios</span>
            Behandlungen
          </Link>
          <span className="text-outline-variant">/</span>
          <span className="font-headline-sm text-headline-sm text-on-surface">{category.name}</span>
          <button
            onClick={() => updateCategory(catId, 'visible', !category.visible)}
            className={`font-label-caps text-[10px] px-2 py-0.5 ml-1 cursor-pointer transition-colors ${
              category.visible ? 'bg-primary/10 text-primary hover:bg-error-container hover:text-error' : 'bg-error-container text-error hover:bg-primary/10 hover:text-primary'
            }`}
            title={category.visible ? 'Klicken zum Verbergen' : 'Klicken zum Anzeigen'}
          >
            {category.visible ? 'Sichtbar' : 'Verborgen'}
          </button>
        </div>
        <div className="flex items-center gap-3">
          {FRONTEND_SLUG[catId] && (
            <a
              href={`/${locale}/${FRONTEND_SLUG[catId]}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 py-2.5 px-4 font-label-caps text-label-caps border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-all"
              title="Frontend-Seite in neuem Tab öffnen"
            >
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              Vorschau
            </a>
          )}
          {catId.startsWith('cat-') && (
            confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="font-label-caps text-[11px] text-error">Wirklich löschen?</span>
                <button
                  onClick={handleDeleteCategory}
                  className="flex items-center gap-1.5 py-2.5 px-4 font-label-caps text-label-caps bg-error text-white hover:brightness-110 transition-all"
                >
                  Ja, löschen
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="py-2.5 px-4 font-label-caps text-label-caps border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-all"
                >
                  Abbrechen
                </button>
              </div>
            ) : (
              <button
                onClick={handleDeleteCategory}
                className="flex items-center gap-1.5 py-2.5 px-4 font-label-caps text-label-caps border border-outline-variant text-on-surface-variant hover:border-error hover:text-error transition-all"
                title="Kategorie löschen"
              >
                <span className="material-symbols-outlined text-[16px]">delete_outline</span>
                Löschen
              </button>
            )
          )}
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 py-2.5 px-5 font-label-caps text-label-caps transition-all ${
              saved ? 'bg-green-600 text-white' : 'bg-primary text-on-primary hover:brightness-110'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{saved ? 'check' : 'save'}</span>
            {saved ? 'Gespeichert!' : 'Speichern'}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 space-y-8">

          {/* ── Service List ──────────────────── */}
          <section className="space-y-0 bg-white border border-outline-variant shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <div className="flex justify-between items-center p-6 border-b border-outline-variant/40">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Services</h3>
                <p className="font-body-sm text-outline mt-0.5">{activeCount} von {services.length} aktiv</p>
              </div>
              <button
                onClick={() => { setAddSvcOpen(true); setTimeout(() => svcNameRef.current?.focus(), 50); }}
                className="flex items-center gap-2 bg-primary text-on-primary py-2 px-4 font-label-caps text-label-caps hover:brightness-110 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Service hinzufügen
              </button>
            </div>

            <div className="grid grid-cols-12 gap-3 px-6 py-2 font-label-caps text-[10px] text-outline uppercase bg-surface-container-lowest border-b border-outline-variant/30">
              <div className="col-span-1" />
              <div className="col-span-4">Bezeichnung</div>
              <div className="col-span-2">Preis (€)</div>
              <div className="col-span-3">Dauer</div>
              <div className="col-span-2 text-right">Aktiv / Löschen</div>
            </div>

            {services.length === 0 && (
              <div className="py-16 text-center text-on-surface-variant opacity-50">
                <span className="material-symbols-outlined text-4xl block mb-3">inbox</span>
                <p className="font-body-sm">Noch keine Services — fügen Sie den ersten hinzu.</p>
              </div>
            )}
            {services.map((svc) => (
              <div
                key={svc.id}
                className={`grid grid-cols-12 gap-3 items-center px-6 py-3.5 border-b border-outline-variant/20 hover:bg-surface-container-lowest transition-colors ${
                  !svc.active ? 'opacity-50' : ''
                }`}
              >
                <div className="col-span-1">
                  <span className="material-symbols-outlined text-outline cursor-move select-none text-[20px]">drag_indicator</span>
                </div>
                <div className="col-span-4">
                  <input
                    className="w-full bg-transparent border-b border-transparent hover:border-outline-variant focus:border-primary font-body-md text-on-surface p-0 focus:outline-none transition-colors"
                    value={svc.name}
                    onChange={(e) => updateService(svc.id, 'name', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <div className="flex items-center gap-1 border border-outline-variant/60 px-2 py-1 focus-within:border-primary transition-colors">
                    <span className="text-primary text-[12px] shrink-0">€</span>
                    <input
                      className="w-full border-none p-0 focus:ring-0 text-[14px] font-medium focus:outline-none bg-transparent"
                      value={svc.price}
                      onChange={(e) => updateService(svc.id, 'price', e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="flex items-center gap-1 border border-outline-variant/60 px-2 py-1 focus-within:border-primary transition-colors">
                    <span className="material-symbols-outlined text-[15px] text-outline shrink-0">schedule</span>
                    <input
                      className="w-full border-none p-0 focus:ring-0 text-[14px] font-medium focus:outline-none bg-transparent"
                      value={svc.duration}
                      onChange={(e) => updateService(svc.id, 'duration', e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-span-2 flex justify-end items-center gap-4">
                  <button
                    onClick={() => updateService(svc.id, 'active', !svc.active)}
                    className={`relative w-10 h-5 rounded-full cursor-pointer transition-colors shrink-0 ${svc.active ? 'bg-primary' : 'bg-outline-variant'}`}
                    aria-label={svc.active ? 'Deaktivieren' : 'Aktivieren'}
                  >
                    <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${svc.active ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                  <button
                    onClick={() => deleteService(svc.id)}
                    className="text-outline hover:text-error transition-colors"
                    aria-label="Löschen"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete_outline</span>
                  </button>
                </div>
              </div>
            ))}

            {addSvcOpen && (
              <div className="grid grid-cols-12 gap-3 items-center px-6 py-4 bg-primary/5 border-b border-primary/20">
                <div className="col-span-1">
                  <span className="material-symbols-outlined text-primary text-[20px]">add_circle</span>
                </div>
                <div className="col-span-4">
                  <input
                    ref={svcNameRef}
                    className="w-full border-b border-primary bg-transparent font-body-md text-on-surface p-0 focus:outline-none placeholder:text-outline"
                    placeholder="Service-Bezeichnung"
                    value={newSvc.name}
                    onChange={(e) => setNewSvc(p => ({ ...p, name: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && addService()}
                  />
                </div>
                <div className="col-span-2">
                  <div className="flex items-center gap-1 border border-primary/40 px-2 py-1">
                    <span className="text-primary text-[12px] shrink-0">€</span>
                    <input
                      className="w-full border-none p-0 focus:ring-0 text-[14px] font-medium focus:outline-none bg-transparent placeholder:text-outline"
                      placeholder="0.00"
                      value={newSvc.price}
                      onChange={(e) => setNewSvc(p => ({ ...p, price: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && addService()}
                    />
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="flex items-center gap-1 border border-primary/40 px-2 py-1">
                    <span className="material-symbols-outlined text-[15px] text-outline shrink-0">schedule</span>
                    <input
                      className="w-full border-none p-0 focus:ring-0 text-[14px] font-medium focus:outline-none bg-transparent placeholder:text-outline"
                      placeholder="30 min"
                      value={newSvc.duration}
                      onChange={(e) => setNewSvc(p => ({ ...p, duration: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && addService()}
                    />
                  </div>
                </div>
                <div className="col-span-2 flex justify-end items-center gap-2">
                  <button
                    onClick={addService}
                    className="bg-primary text-on-primary font-label-caps text-[11px] px-3 py-1.5 hover:brightness-110 transition-all"
                  >
                    Hinzufügen
                  </button>
                  <button
                    onClick={() => { setAddSvcOpen(false); setNewSvc(EMPTY_SERVICE); }}
                    className="text-outline hover:text-error transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>
              </div>
            )}
          </section>

            {/* Campaigns — full-width, spacious grid below the services */}
            <section className="bg-surface-container-lowest border border-outline-variant shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between p-6 border-b border-outline-variant/40">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">auto_fix_high</span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Kampagnen</h3>
                </div>
                <button
                  onClick={() => setAddCmpOpen(true)}
                  className="flex items-center gap-1 text-primary font-label-caps text-[11px] border-b border-primary pb-0.5 hover:opacity-70 transition-opacity"
                >
                  + Hinzufügen
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                {campaigns.length === 0 && (
                  <p className="md:col-span-2 py-10 text-center font-body-sm text-outline opacity-60">
                    Noch keine Kampagnen.
                  </p>
                )}
                {(() => {
                  const activeIds = campaigns.filter(c => c.active).map(c => c.id);
                  return campaigns.map((cmp) => {
                    const activeSlot = cmp.active ? activeIds.indexOf(cmp.id) : -1;
                    const slotLabel =
                      !cmp.active ? null :
                      activeSlot === 0 ? 'Banner 1' :
                      activeSlot === 1 ? 'Banner 2' :
                      'Kein Banner-Platz (nur Liste)';
                    return (
                  <div key={cmp.id} className={`bg-white border border-outline-variant/60 shadow-[0_1px_6px_rgba(0,0,0,0.05)] p-5 space-y-3 relative group transition-opacity ${!cmp.active ? 'opacity-40' : ''}`}>
                    <div className="flex items-center justify-between">
                      {slotLabel && (
                        <span className={`font-label-caps text-[9px] px-2 py-0.5 ${
                          activeSlot < 2 ? 'bg-primary/10 text-primary' : 'bg-outline-variant/20 text-outline'
                        }`}>
                          {slotLabel}
                        </span>
                      )}
                      <div className="flex items-center gap-2 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => updateCampaign(cmp.id, 'active', !cmp.active)}
                        className={`relative w-8 h-4 rounded-full transition-colors shrink-0 ${cmp.active ? 'bg-primary' : 'bg-outline-variant'}`}
                        aria-label={cmp.active ? 'Verbergen' : 'Anzeigen'}
                        title={cmp.active ? 'Kampagne verbergen' : 'Kampagne anzeigen'}
                      >
                        <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${cmp.active ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                      <button
                        onClick={() => deleteCampaign(cmp.id)}
                        className="text-outline hover:text-error transition-colors"
                        aria-label="Kampagne löschen"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete_outline</span>
                      </button>
                      </div>
                    </div>
                    <input
                      className="font-label-caps text-[10px] text-primary bg-transparent border-none focus:outline-none w-full"
                      value={cmp.label}
                      onChange={(e) => updateCampaign(cmp.id, 'label', e.target.value)}
                      placeholder="LABEL"
                    />
                    <input
                      className="font-headline-sm text-[16px] text-on-surface bg-transparent border-b border-transparent hover:border-outline-variant focus:border-primary focus:outline-none w-full transition-colors"
                      value={cmp.title}
                      onChange={(e) => updateCampaign(cmp.id, 'title', e.target.value)}
                      placeholder="Titel der Kampagne"
                    />
                    <textarea
                      className="font-body-sm text-[13px] text-on-surface-variant bg-transparent border-b border-transparent hover:border-outline-variant focus:border-primary focus:outline-none w-full resize-none transition-colors"
                      rows={2}
                      value={cmp.desc}
                      onChange={(e) => updateCampaign(cmp.id, 'desc', e.target.value)}
                      placeholder="Beschreibung..."
                    />
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 border border-outline-variant px-2 py-1 w-28 focus-within:border-primary transition-colors">
                        <span className="font-label-caps text-[10px] text-primary shrink-0">Preis</span>
                        <input
                          className="w-full border-none p-0 text-[14px] font-bold text-primary focus:outline-none bg-transparent"
                          value={cmp.price}
                          onChange={(e) => updateCampaign(cmp.id, 'price', e.target.value)}
                          placeholder="0,00€"
                        />
                      </div>
                      <div className="flex items-center gap-1 border border-outline-variant/50 px-2 py-1 w-28 focus-within:border-primary transition-colors">
                        <span className="font-label-caps text-[10px] text-outline shrink-0">Statt</span>
                        <input
                          className="w-full border-none p-0 text-[13px] text-outline line-through focus:outline-none bg-transparent"
                          value={cmp.oldPrice ?? ''}
                          onChange={(e) => updateCampaign(cmp.id, 'oldPrice', e.target.value)}
                          placeholder="0,00€"
                        />
                      </div>
                    </div>
                    {/* CTA + Icon */}
                    <div className="flex gap-2 items-center">
                      <input
                        className="flex-1 border-b border-outline-variant/50 focus:border-primary bg-transparent text-[12px] py-0.5 focus:outline-none placeholder:text-outline"
                        value={cmp.cta}
                        onChange={(e) => updateCampaign(cmp.id, 'cta', e.target.value)}
                        placeholder="CTA Text (z.B. JETZT BUCHEN)"
                      />
                      <input
                        className="w-32 border-b border-outline-variant/50 focus:border-primary bg-transparent text-[12px] py-0.5 focus:outline-none placeholder:text-outline font-mono"
                        value={cmp.icon}
                        onChange={(e) => updateCampaign(cmp.id, 'icon', e.target.value)}
                        placeholder="Icon-Name"
                      />
                    </div>
                    <ImageUpload
                      value={cmp.image}
                      onChange={v => updateCampaign(cmp.id, 'image', v)}
                      position={cmp.imagePosition}
                      onPositionChange={p => updateCampaign(cmp.id, 'imagePosition', p)}
                    />
                  </div>
                    );
                  });
                })()}

                {addCmpOpen && (
                  <div className="md:col-span-2 p-5 bg-primary/5 space-y-3">
                    <input
                      className="font-label-caps text-[10px] text-primary bg-transparent border-b border-primary/40 focus:outline-none w-full placeholder:text-outline"
                      value={newCmp.label}
                      onChange={(e) => setNewCmp(p => ({ ...p, label: e.target.value }))}
                      placeholder="LABEL (z.B. AKTION)"
                    />
                    <input
                      className="font-headline-sm text-[15px] text-on-surface bg-transparent border-b border-primary/40 focus:outline-none w-full placeholder:text-outline"
                      value={newCmp.title}
                      onChange={(e) => setNewCmp(p => ({ ...p, title: e.target.value }))}
                      placeholder="Kampagnentitel *"
                    />
                    <textarea
                      className="font-body-sm text-[13px] bg-transparent border-b border-primary/40 focus:outline-none w-full resize-none placeholder:text-outline"
                      rows={2}
                      value={newCmp.desc}
                      onChange={(e) => setNewCmp(p => ({ ...p, desc: e.target.value }))}
                      placeholder="Kurzbeschreibung..."
                    />
                    <div className="flex gap-2">
                      <input
                        className="w-24 border border-primary/40 px-2 py-1 text-[13px] font-bold text-primary focus:outline-none bg-transparent placeholder:text-outline"
                        value={newCmp.price}
                        onChange={(e) => setNewCmp(p => ({ ...p, price: e.target.value }))}
                        placeholder="Preis"
                      />
                      <input
                        className="w-24 border border-outline-variant/40 px-2 py-1 text-[13px] text-outline focus:outline-none bg-transparent placeholder:text-outline"
                        value={newCmp.oldPrice}
                        onChange={(e) => setNewCmp(p => ({ ...p, oldPrice: e.target.value }))}
                        placeholder="Statt"
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        className="flex-1 border border-primary/40 px-2 py-1 text-[12px] focus:outline-none bg-transparent placeholder:text-outline"
                        value={newCmp.cta}
                        onChange={(e) => setNewCmp(p => ({ ...p, cta: e.target.value }))}
                        placeholder="CTA (z.B. JETZT BUCHEN)"
                      />
                      <input
                        className="w-32 border border-primary/40 px-2 py-1 text-[12px] font-mono focus:outline-none bg-transparent placeholder:text-outline"
                        value={newCmp.icon}
                        onChange={(e) => setNewCmp(p => ({ ...p, icon: e.target.value }))}
                        placeholder="Icon-Name"
                      />
                    </div>
                    <ImageUpload
                      value={newCmp.image}
                      onChange={v => setNewCmp(p => ({ ...p, image: v }))}
                    />
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={addCampaign}
                        className="bg-primary text-on-primary font-label-caps text-[11px] px-4 py-1.5 hover:brightness-110 transition-all"
                      >
                        Hinzufügen
                      </button>
                      <button
                        onClick={() => { setAddCmpOpen(false); setNewCmp(EMPTY_CAMPAIGN); }}
                        className="font-label-caps text-[11px] text-outline hover:text-error transition-colors px-2"
                      >
                        Abbrechen
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Category details — name & the short hover-description shown on the landing page card */}
            <section className="bg-surface-container-lowest border border-outline-variant p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-4">
              <span className="font-label-caps text-[10px] text-outline block">KATEGORIE-DETAILS</span>
              <div>
                <label className="font-label-caps text-[9px] text-outline uppercase tracking-wider block mb-1">Name</label>
                <input
                  className="w-full bg-transparent border-b border-outline-variant/50 focus:border-primary focus:outline-none font-headline-sm text-[15px] text-on-surface py-1 transition-colors"
                  value={category.name}
                  onChange={e => updateCategory(catId, 'name', e.target.value)}
                />
              </div>
              <div>
                <label className="font-label-caps text-[9px] text-outline uppercase tracking-wider block mb-1">Kurzbeschreibung (Hover-Text auf der Karte)</label>
                <input
                  className="w-full bg-transparent border-b border-outline-variant/50 focus:border-primary focus:outline-none font-body-sm text-[13px] text-on-surface py-1 transition-colors"
                  value={category.desc}
                  onChange={e => updateCategory(catId, 'desc', e.target.value)}
                />
              </div>
              <div>
                <label className="font-label-caps text-[9px] text-outline uppercase tracking-wider block mb-1">Kicker-Label (kleine Zeile über dem Namen auf der Karte)</label>
                <input
                  className="w-full bg-transparent border-b border-outline-variant/50 focus:border-primary focus:outline-none font-label-caps text-[11px] uppercase tracking-widest text-on-surface py-1 transition-colors"
                  value={category.kicker}
                  onChange={e => updateCategory(catId, 'kicker', e.target.value)}
                />
              </div>
            </section>

            {/* Category image (used for the tile on the landing page) */}
            <section className="bg-surface-container-lowest border border-outline-variant p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
              <span className="font-label-caps text-[10px] text-outline mb-3 block">KATEGORIE-BILD (FRONTEND)</span>
              <div className="max-w-xs">
              {category.image ? (
                <div className="relative group cursor-pointer" onClick={() => catImgRef.current?.click()}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={category.image} alt="" className="aspect-[4/3] w-full object-cover border border-outline-variant/30" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <span className="bg-white/90 px-2 py-1 font-label-caps text-[10px] text-primary">Ändern</span>
                    <span
                      className="bg-white/90 px-2 py-1 font-label-caps text-[10px] text-error cursor-pointer"
                      onClick={e => { e.stopPropagation(); updateCategory(catId, 'image', ''); }}
                    >Entfernen</span>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => catImgRef.current?.click()}
                  className="aspect-[4/3] w-full border border-outline-variant flex flex-col items-center justify-center gap-3 relative overflow-hidden group cursor-pointer"
                  style={{ background: PREVIEW_GRADIENT[catId] ?? 'linear-gradient(135deg,#f6f3f2,#e5e2dc)' }}
                >
                  <span className="material-symbols-outlined text-5xl opacity-25" style={{ color: '#745b00' }}>
                    {category.icon}
                  </span>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="bg-white/90 px-4 py-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px]">cloud_upload</span>
                      <span className="font-label-caps text-[11px] text-primary">Bild hochladen</span>
                    </div>
                  </div>
                </div>
              )}
              <input
                ref={catImgRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => updateCategory(catId, 'image', reader.result as string);
                  reader.readAsDataURL(file);
                  e.target.value = '';
                }}
              />
              <p className="font-body-sm text-[12px] italic text-outline mt-3">Ohne eigenes Bild wird das Standardfoto verwendet.</p>
              </div>
            </section>

        {/* ── Seiteninhalt ─────────────────────────────────── */}
        {pc && (
          <section className="bg-white border border-outline-variant shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            {/* Section header — accordion toggle */}
            <button
              onClick={() => setContentOpen(o => !o)}
              className="w-full flex items-center justify-between p-6 border-b border-outline-variant/40 hover:bg-surface-container-lowest transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[20px]">edit_document</span>
                <div className="text-left">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Seiteninhalt</h3>
                  <p className="font-body-sm text-[12px] text-outline mt-0.5">Hero · Info & Vorteile · Kampagnen-Banner</p>
                </div>
              </div>
              <span className={`material-symbols-outlined text-outline transition-transform ${contentOpen ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>

            {contentOpen && (
              <div>
                {/* Tab bar */}
                <div className="flex border-b border-outline-variant/40 px-6">
                  {(['hero', 'info', 'banners'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setContentTab(tab)}
                      className={`py-3 px-5 font-label-caps text-[11px] border-b-2 transition-colors -mb-px ${
                        contentTab === tab
                          ? 'border-primary text-primary'
                          : 'border-transparent text-outline hover:text-on-surface'
                      }`}
                    >
                      {tab === 'hero' ? 'Hero' : tab === 'info' ? 'Info & Vorteile' : 'Kampagnen-Banner'}
                    </button>
                  ))}
                </div>

                <div className="p-6 space-y-6">

                  {/* ── Hero tab ── */}
                  {contentTab === 'hero' && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-2 gap-5">
                        <Field label="Label (Subheading)">
                          <input
                            className={INPUT_CLS}
                            value={pc.label}
                            onChange={e => updatePageField(catId, 'label', e.target.value)}
                            placeholder="z.B. Signature Treatment"
                          />
                        </Field>
                        <Field label="H1 (Seitentitel)">
                          <input
                            className={INPUT_CLS}
                            value={pc.h1}
                            onChange={e => updatePageField(catId, 'h1', e.target.value)}
                            placeholder="z.B. Laser-Haarentfernung"
                          />
                        </Field>
                      </div>
                      <Field label="Hero-Beschreibung">
                        <textarea
                          className={`${INPUT_CLS} resize-none`}
                          rows={3}
                          value={pc.heroDesc}
                          onChange={e => updatePageField(catId, 'heroDesc', e.target.value)}
                          placeholder="Kurzer Einleitungstext unter dem H1..."
                        />
                      </Field>
                      <Field label="Hero-Bild">
                        <ImageUpload
                          value={pc.heroImage}
                          onChange={v => updatePageField(catId, 'heroImage', v)}
                        />
                      </Field>
                    </div>
                  )}

                  {/* ── Info & Vorteile tab ── */}
                  {contentTab === 'info' && (
                    <div className="space-y-6">
                      <Field label="Info-Titel">
                        <input
                          className={INPUT_CLS}
                          value={pc.infoTitle}
                          onChange={e => updatePageField(catId, 'infoTitle', e.target.value)}
                          placeholder="z.B. Die Zukunft der Hautpflege"
                        />
                      </Field>
                      <Field label="Absatz 1">
                        <textarea
                          className={`${INPUT_CLS} resize-none`}
                          rows={4}
                          value={pc.infoParagraphs[0]}
                          onChange={e => updatePageParagraph(catId, 0, e.target.value)}
                        />
                      </Field>
                      <Field label="Absatz 2">
                        <textarea
                          className={`${INPUT_CLS} resize-none`}
                          rows={4}
                          value={pc.infoParagraphs[1]}
                          onChange={e => updatePageParagraph(catId, 1, e.target.value)}
                        />
                      </Field>

                      <div className="border-t border-outline-variant/30 pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <Field label="Vorteile-Titel" className="flex-1 mr-6">
                            <input
                              className={INPUT_CLS}
                              value={pc.benefitsTitle}
                              onChange={e => updatePageField(catId, 'benefitsTitle', e.target.value)}
                              placeholder="z.B. Gesundheitliche Wirkung"
                            />
                          </Field>
                          {pc.benefits.length < 6 && (
                            <button
                              onClick={() => addPageBenefit(catId)}
                              className="flex items-center gap-1 text-primary font-label-caps text-[11px] border-b border-primary pb-0.5 hover:opacity-70 transition-opacity shrink-0 self-end mb-0.5"
                            >
                              <span className="material-symbols-outlined text-[14px]">add</span>
                              Punkt hinzufügen
                            </button>
                          )}
                        </div>
                        <div className="space-y-3">
                          {pc.benefits.map((b, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <span className="material-symbols-outlined text-primary text-[18px] shrink-0">check_circle</span>
                              <input
                                className={`${INPUT_CLS} flex-1`}
                                value={b}
                                onChange={e => updatePageBenefit(catId, i, e.target.value)}
                                placeholder={`Vorteil ${i + 1}`}
                              />
                              {pc.benefits.length > 1 && (
                                <button
                                  onClick={() => removePageBenefit(catId, i)}
                                  className="text-outline hover:text-error transition-colors shrink-0"
                                >
                                  <span className="material-symbols-outlined text-[18px]">delete_outline</span>
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Kampagnen-Banner tab ── */}
                  {contentTab === 'banners' && (
                    <div className="space-y-8">
                      {([1, 2] as const).map(which => {
                        const banner: PageBanner = which === 1 ? pc.campaign1 : pc.campaign2;
                        const bgClass = which === 1 ? 'bg-primary-container/30' : 'bg-surface-container-low';
                        return (
                          <div key={which} className={`p-5 border border-outline-variant/40 ${bgClass} space-y-4`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="material-symbols-outlined text-primary text-[16px]">{banner.icon || 'campaign'}</span>
                              <span className="font-label-caps text-[10px] text-primary">BANNER {which}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <Field label="Label">
                                <input
                                  className={INPUT_CLS}
                                  value={banner.label}
                                  onChange={e => updatePageBanner(catId, which, 'label', e.target.value)}
                                  placeholder="z.B. Limited Edition Offer"
                                />
                              </Field>
                              <Field label="Icon (Material Symbol)">
                                <div className="flex items-center gap-2">
                                  <input
                                    className={`${INPUT_CLS} flex-1`}
                                    value={banner.icon}
                                    onChange={e => updatePageBanner(catId, which, 'icon', e.target.value)}
                                    placeholder="z.B. auto_awesome"
                                  />
                                  <span className="material-symbols-outlined text-primary text-[20px] shrink-0">{banner.icon || 'help_outline'}</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {BANNER_ICONS.map(ic => (
                                    <button
                                      key={ic}
                                      onClick={() => updatePageBanner(catId, which, 'icon', ic)}
                                      className={`material-symbols-outlined text-[18px] p-1 border transition-colors ${banner.icon === ic ? 'border-primary text-primary bg-primary/5' : 'border-outline-variant/40 text-outline hover:border-primary hover:text-primary'}`}
                                      title={ic}
                                    >
                                      {ic}
                                    </button>
                                  ))}
                                </div>
                              </Field>
                            </div>
                            <Field label="Titel">
                              <input
                                className={INPUT_CLS}
                                value={banner.title}
                                onChange={e => updatePageBanner(catId, which, 'title', e.target.value)}
                                placeholder="Banner-Titel"
                              />
                            </Field>
                            <Field label="Beschreibung (Body)">
                              <textarea
                                className={`${INPUT_CLS} resize-none`}
                                rows={3}
                                value={banner.body}
                                onChange={e => updatePageBanner(catId, which, 'body', e.target.value)}
                                placeholder="Banner-Text..."
                              />
                            </Field>
                            <div className="grid grid-cols-2 gap-4">
                              <Field label="CTA-Button Text">
                                <input
                                  className={INPUT_CLS}
                                  value={banner.cta}
                                  onChange={e => updatePageBanner(catId, which, 'cta', e.target.value)}
                                  placeholder="z.B. JETZT SICHERN"
                                />
                              </Field>
                              <Field label="Bild">
                                <ImageUpload
                                  value={banner.image}
                                  onChange={v => updatePageBanner(catId, which, 'image', v)}
                                />
                              </Field>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </>
  );
}

/* ── Small helpers ─────────────────────────────────────── */
const INPUT_CLS = 'w-full border border-outline-variant/60 px-3 py-2 text-[13px] text-on-surface bg-white focus:border-primary focus:outline-none transition-colors font-body-md placeholder:text-outline';

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider block">{label}</label>
      {children}
    </div>
  );
}

const POSITION_OPTIONS: { value: ImagePosition; label: string; icon: string }[] = [
  { value: 'top',    label: 'Oben',  icon: 'vertical_align_top' },
  { value: 'center', label: 'Mitte', icon: 'vertical_align_center' },
  { value: 'bottom', label: 'Unten', icon: 'vertical_align_bottom' },
];

function ImageUpload({
  value, onChange, className, position, onPositionChange,
}: {
  value: string; onChange: (v: string) => void; className?: string;
  position?: ImagePosition; onPositionChange?: (p: ImagePosition) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };
  return (
    <div className={`space-y-1 ${className ?? ''}`}>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {value ? (
        <div className="relative group cursor-pointer" onClick={() => ref.current?.click()}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="h-16 w-full object-cover border border-outline-variant/30" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <span className="bg-white/90 px-2 py-1 font-label-caps text-[10px] text-primary">Ändern</span>
            <span
              className="bg-white/90 px-2 py-1 font-label-caps text-[10px] text-error"
              onClick={e => { e.stopPropagation(); onChange(''); }}
            >Entfernen</span>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="w-full border border-dashed border-outline-variant/50 hover:border-primary/60 py-3 flex flex-col items-center gap-1 transition-colors group"
        >
          <span className="material-symbols-outlined text-[20px] text-outline group-hover:text-primary transition-colors">cloud_upload</span>
          <span className="font-label-caps text-[10px] text-outline group-hover:text-primary transition-colors">Bild hochladen</span>
        </button>
      )}
      {value && onPositionChange && (
        <div className="flex gap-1">
          {POSITION_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onPositionChange(opt.value)}
              title={`Bildausschnitt: ${opt.label}`}
              className={`flex-1 flex items-center justify-center gap-1 py-1 font-label-caps text-[9px] border transition-colors ${
                (position ?? 'top') === opt.value
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-outline-variant/40 text-outline hover:border-primary hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
