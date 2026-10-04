import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../shared/lib/session';
import { useSession } from '../../../shared/lib/useSession';

export interface AirtimeProduct {
  code: string;
  network: string;
  kind: 'airtime' | 'data';
  name: string;
  price: number | null;
}

export interface AirtimeCatalogue {
  networks: { code: string; name: string }[];
  products: AirtimeProduct[];
  minAirtime: number;
  maxAirtime: number;
  dailyLimit: number;
  spentToday: number;
}

export interface AirtimeOrder {
  orderId: string;
  clientRequestId: string;
  network: string;
  networkName: string;
  productCode: string;
  product: string | null;
  msisdn: string;
  amount: number;
  currency: string;
  status: 'pending' | 'fulfilled' | 'refunded' | 'failed';
  reason: string | null;
  createdAt: string;
}

export interface BuyRequest {
  clientRequestId: string;
  productCode: string;
  amount?: number;
  msisdn: string;
}

const catalogueKey = ['me', 'airtime', 'products'] as const;
const ordersKey = ['me', 'airtime', 'orders'] as const;

export function useAirtimeCatalogue() {
  const signedIn = useSession().data?.signedIn === true;
  return useQuery({ queryKey: catalogueKey, queryFn: () => api<AirtimeCatalogue>('/me/airtime/products'), enabled: signedIn });
}

export function useAirtimeOrders() {
  const signedIn = useSession().data?.signedIn === true;
  return useQuery({ queryKey: ordersKey, queryFn: () => api<AirtimeOrder[]>('/me/airtime'), enabled: signedIn });
}

export function useBuyAirtime() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: BuyRequest) => api<AirtimeOrder>('/me/airtime', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ordersKey });
      void queryClient.invalidateQueries({ queryKey: catalogueKey });
      void queryClient.invalidateQueries({ queryKey: ['me', 'balance'] });
    },
  });
}

/** A South African cellphone number in local form (0821234567), or null when it is not one. */
export function localNumber(input: string): string | null {
  const digits = input.replace(/\D/g, '');
  const national = digits.length === 10 && digits.startsWith('0') ? digits.slice(1) : digits.length === 11 && digits.startsWith('27') ? digits.slice(2) : null;
  return national !== null && /^[678]\d{8}$/.test(national) ? `0${national}` : null;
}

/** 0821234567 as 082 123 4567. */
export const spacedNumber = (local: string) => `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;

const messages: Record<string, string> = {
  daily_limit: "You have reached today's airtime and data limit.",
  insufficient_funds: 'Your balance is too low for this purchase.',
  invalid_number: 'Enter a South African cellphone number, like 082 123 4567.',
  account_restricted: 'Your account cannot buy airtime right now.',
  account_blocked: 'Your account cannot buy airtime right now.',
};

/** A plain message for a refused purchase; the server's own message for anything else. */
export const buyErrorMessage = (code: string | undefined, fallback: string) => (code && messages[code]) || fallback;
