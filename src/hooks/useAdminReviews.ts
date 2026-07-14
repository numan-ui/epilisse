'use client';
import { useState, useEffect } from 'react';
import { INIT_REVIEWS, type Review } from '@/app/[locale]/admin/behandlungen/data';

const LS_REVIEWS = 'epilisse_admin_reviews';

/** Returns active reviews, reading from localStorage (admin state), falling back to defaults when empty. */
export function useAdminReviews(): Review[] {
  const [reviews, setReviews] = useState<Review[]>(INIT_REVIEWS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_REVIEWS);
      if (!raw) return;
      const stored: Review[] = JSON.parse(raw);
      if (stored.length === 0) return;
      setReviews(stored);
    } catch { /* ignore */ }
  }, []);

  return reviews.filter(r => r.active);
}
