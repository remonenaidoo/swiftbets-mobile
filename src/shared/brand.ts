import { brands } from '@swiftbets/design-tokens';

export type BrandId = keyof typeof brands;

/** The brand is chosen at build time; one build serves one brand and never switches at runtime. */
export const brandId: BrandId = process.env.EXPO_PUBLIC_BRAND === 'swiftplay' ? 'swiftplay' : 'swiftbets';

export const brandTokens = brands[brandId];

export const brandName = brandTokens.name;

export const pageTitle = (page?: string) => (page ? `${page} · ${brandName}` : brandName);
