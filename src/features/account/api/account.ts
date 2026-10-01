import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, signIn, signOut } from '../../../shared/lib/session';
import { sessionQueryKey } from '../../../shared/lib/useSession';

const json = (body: unknown): RequestInit => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

export interface RegisterRequest {
  email: string;
  password: string;
  dateOfBirth: string;
  country: string;
  currency: string;
}

export function useRegister() {
  return useMutation({ mutationFn: (request: RegisterRequest) => api<{ message: string }>('/auth/register', json(request)) });
}

export function useSignIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ login, password }: { login: string; password: string }) => signIn(login, password),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: sessionQueryKey });
      await queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signOut,
    onSettled: async () => {
      queryClient.removeQueries({ queryKey: ['me'] });
      await queryClient.invalidateQueries({ queryKey: sessionQueryKey });
    },
  });
}

export function useVerifyEmail() {
  return useMutation({ mutationFn: (token: string) => api<void>('/auth/verify-email', json({ token })) });
}

export function useResendVerification() {
  return useMutation({ mutationFn: (email: string) => api<void>('/auth/verify-email/resend', json({ email })) });
}

export function useRequestPasswordReset() {
  return useMutation({ mutationFn: (email: string) => api<void>('/auth/password-reset', json({ email })) });
}

export function useResetPassword() {
  return useMutation({ mutationFn: ({ token, password }: { token: string; password: string }) => api<void>('/auth/password-reset/confirm', json({ token, password })) });
}
