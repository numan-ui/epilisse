'use client';
import { createContext, useContext, useMemo, useState, useCallback, type ReactNode } from 'react';

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

  const open = useCallback((catId?: string) => {
    setCategoryId(catId ?? null);
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(() => ({ isOpen, categoryId, open, close }), [isOpen, categoryId, open, close]);

  return <BookingModalCtx.Provider value={value}>{children}</BookingModalCtx.Provider>;
}

export function useBookingModal(): BookingModalState {
  const ctx = useContext(BookingModalCtx);
  if (!ctx) throw new Error('useBookingModal must be used within BookingModalProvider');
  return ctx;
}
