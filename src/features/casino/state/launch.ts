import { atom } from 'jotai';

/** The session the lobby just launched, held in memory only: a URL in the address bar could be crafted to frame any page. */
export const launchedGameAtom = atom<{ url: string; name: string } | null>(null);
