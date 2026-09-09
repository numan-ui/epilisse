'use client';
import { useBookingModal } from '@/context/BookingModalContext';
import BookingFlow from './BookingFlow';

/**
 * Global booking dialog, mounted once in the locale layout and driven by
 * BookingModalContext (opened from every "Termin buchen" CTA). The wizard
 * itself lives in BookingFlow, which also powers the inline homepage form.
 */
export default function BookingModal() {
  const { isOpen, categoryId, close } = useBookingModal();

  return (
    <BookingFlow
      variant="modal"
      active={isOpen}
      preselectedCategory={categoryId}
      onClose={close}
    />
  );
}
