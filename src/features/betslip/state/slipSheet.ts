import { atom } from 'jotai';

/** Whether the betslip sheet is open on narrow screens; the bottom bar and "add to slip" both open it. */
export const slipSheetAtom = atom(false);
