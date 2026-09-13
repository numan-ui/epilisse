'use client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useBookingModal } from '@/context/BookingModalContext';

/**
 * Lets a direct link open the booking modal on load, e.g.
 * https://epilisse.de/?termin=1 or .../laser-haarentfernung?termin=laser
 * (the value is used as the preselected category id when it isn't "1").
 */
export default function BookingModalFromUrl() {
  const searchParams = useSearchParams();
  const { open } = useBookingModal();

  useEffect(() => {
    const termin = searchParams.get('termin');
    if (termin === null) return;
    open(termin === '1' ? undefined : termin);
  }, [searchParams, open]);

  return null;
}
