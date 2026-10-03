import { useQuery } from '@tanstack/react-query';
import { api } from '../../../shared/lib/session';
import { useLiveInvalidation } from '../../../shared/realtime/useLive';

export interface SiteBanner {
  id: string;
  title: string;
  subtitle: string | null;
  ctaLabel: string | null;
  imageKey: string;
  link: string | null;
}

export interface QuickLink {
  id: string;
  label: string;
  link: string;
  icon: string | null;
}

export interface HomeContent {
  banners: SiteBanner[];
  quickLinks: QuickLink[];
}

export interface SitePage {
  slug: string;
  title: string;
  body: string;
  updatedAt: string;
}

/** The pages every visitor can reach from the menu and the footer. */
export const sitePages = [
  { slug: 'help', label: 'Help' },
  { slug: 'faq', label: 'FAQ' },
  { slug: 'responsible-gambling', label: 'Responsible gambling' },
  { slug: 'terms', label: 'Terms' },
  { slug: 'privacy', label: 'Privacy' },
  { slug: 'contact', label: 'Contact us' },
] as const;

export function pagePath(slug: string): string {
  return sitePages.some((p) => p.slug === slug) ? `/${slug}` : `/p/${slug}`;
}

/** Banners and quick links managed in the console; an edit there refreshes open clients over the live connection. */
export function useHomeContent() {
  useLiveInvalidation(['content-changed'], ['content']);
  return useQuery({ queryKey: ['content', 'home'], queryFn: () => api<HomeContent>('/content/home'), retry: 1 });
}

export function usePage(slug: string) {
  useLiveInvalidation(['content-changed'], ['content']);
  return useQuery({ queryKey: ['content', 'page', slug], queryFn: () => api<SitePage>(`/content/pages/${encodeURIComponent(slug)}`), retry: false });
}
