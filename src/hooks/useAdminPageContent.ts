'use client';
import { useState, useEffect } from 'react';
import { INIT_PAGE_CONTENT, type PageContent } from '@/app/[locale]/admin/behandlungen/data';

const LS_PC = 'epilisse_admin_page_content';

export function useAdminPageContent(catId: string): PageContent {
  const [content, setContent] = useState<PageContent>(INIT_PAGE_CONTENT[catId]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_PC);
      if (!raw) return;
      const all: Record<string, PageContent> = JSON.parse(raw);
      if (all[catId]) setContent(all[catId]);
    } catch { /* ignore */ }
  }, [catId]);

  return content;
}
