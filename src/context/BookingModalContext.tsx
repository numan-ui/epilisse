'use client';
import { createContext, useContext, useMemo, useState, useCallback, type ReactNode } from 'react';
import { useAdminSettings } from '@/hooks/useAdminSettings';

interface BookingModalState {
  isOpen: boolean;
  categoryId: string | null;
  open: (categoryId?: string) => void;
  close: () => void;
}

const BookingModalCtx = createContext<BookingModalState | null>(null);

export function BookingModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const treatwellUrl = useAdminSettings().treatwellBookingUrl.trim();

  const open = useCallback((catId?: string) => {
    // All "Termin buchen" entry points go straight to Treatwell (its live
    // calendar is the single source of availability, direct bookings from our
    // site are commission-free). Own modal only if the admin URL is cleared.
    if (treatwellUrl) {
      // No 'noopener' in the features string: it makes window.open return null,
      // which looks like a blocked popup. Sever the opener manually instead.
      // Outside a click (?termin=1 on load) the browser may block it; the page stays put.
      const w = window.open(treatwellUrl, '_blank');
      if (w) w.opener = null;
      return;
    }
    setCategoryId(catId ?? null);
    setIsOpen(true);
  }, [treatwellUrl]);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(() => ({ isOpen, categoryId, open, close }), [isOpen, categoryId, open, close]);

  return <BookingModalCtx.Provider value={value}>{children}</BookingModalCtx.Provider>;
}

export function useBookingModal(): BookingModalState {
  const ctx = useContext(BookingModalCtx);
  if (!ctx) throw new Error('useBookingModal must be used within BookingModalProvider');
  return ctx;
}
