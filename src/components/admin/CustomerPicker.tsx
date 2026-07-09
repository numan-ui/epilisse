'use client';
import { useMemo, useState } from 'react';

export type PickableCustomer = { id: string; name: string; phone?: string | null; email?: string | null };

// Shared searchable customer picker used by Termine's "Neuer Termin" modal
// (single-select) and Kampanyalar's audience picker (multi-select).
export function CustomerPicker({
  customers,
  value,
  onChange,
  multiple = false,
  placeholder = 'Kundin suchen…',
}: {
  customers: PickableCustomer[];
  value: string[];
  onChange: (ids: string[]) => void;
  multiple?: boolean;
  placeholder?: string;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.phone ?? '').includes(q) ||
      (c.email ?? '').toLowerCase().includes(q)
    );
  }, [customers, query]);

  const selectedCustomers = customers.filter(c => value.includes(c.id));

  const toggle = (id: string) => {
    if (multiple) {
      if (value.includes(id)) {
        onChange(value.filter(v => v !== id));
      } else {
        onChange([...value, id]);
        setOpen(false);
        setQuery('');
      }
    } else {
      onChange([id]);
      setOpen(false);
      setQuery('');
    }
  };

  return (
    <div className="relative">
      {!multiple && selectedCustomers[0] ? (
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between border-b border-outline-variant bg-transparent py-2 font-body-md text-on-surface focus:outline-none transition-all text-left"
        >
          <span>{selectedCustomers[0].name}</span>
          <span className="material-symbols-outlined text-[16px] text-outline">expand_more</span>
        </button>
      ) : (
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          className="w-full border-b border-outline-variant bg-transparent py-2 font-body-md text-on-surface focus:border-primary focus:outline-none transition-all"
        />
      )}

      {multiple && selectedCustomers.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selectedCustomers.map(c => (
            <span key={c.id} className="flex items-center gap-1 bg-primary/10 text-primary font-label-caps text-[10px] px-2 py-1">
              {c.name}
              <button type="button" onClick={() => toggle(c.id)} className="hover:text-error">
                <span className="material-symbols-outlined text-[13px]">close</span>
              </button>
            </span>
          ))}
        </div>
      )}

      {open && (
        <div className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto bg-surface border border-outline-variant shadow-lg">
          {filtered.length === 0 && (
            <p className="p-3 font-body-sm text-outline text-center">Keine Treffer.</p>
          )}
          {filtered.map(c => (
            <button
              type="button"
              key={c.id}
              onClick={() => toggle(c.id)}
              className={`w-full text-left px-3 py-2 font-body-sm hover:bg-surface-container-low transition-colors flex items-center justify-between ${
                value.includes(c.id) ? 'text-primary bg-primary/5' : 'text-on-surface'
              }`}
            >
              <span>{c.name}</span>
              {value.includes(c.id) && <span className="material-symbols-outlined text-[16px]">check</span>}
            </button>
          ))}
          {!multiple && (
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full text-center px-3 py-2 font-label-caps text-[10px] text-outline border-t border-outline-variant/30 hover:text-primary"
            >
              Schließen
            </button>
          )}
        </div>
      )}
    </div>
  );
}
