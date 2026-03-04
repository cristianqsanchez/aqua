'use server';

import { cookies } from 'next/headers';

import { createClient } from '@/lib/supabase/server';

export async function getProfileUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;

  const user = data?.user;
  if (!user) return null;

  const displayName =
    (user.user_metadata?.name as string | undefined) ||

    (user.user_metadata?.full_name as string | undefined) ||
    (user.email ? user.email.split('@')[0] : '') ||
    'Usuario';


  const role =
    (user.app_metadata?.role as string | undefined) ||
    (user.user_metadata?.role as string | undefined) ||
    '';

  // Keep label generic; UI i18n can override later if you want
  const roleLabel = role ? role : '';

  return {
    displayName,
    email: user.email ?? '',
    roleLabel,
  };
}

export async function setLocaleCookie(locale: string) {
  const store = await cookies();
  // Common cookie name used by next-intl setups; adjust if your middleware uses another key.
  store.set('NEXT_LOCALE', locale, { path: '/', sameSite: 'lax' });
}

export async function updatePassword(input: { currentPassword: string; newPassword: string }) {
  const supabase = await createClient();

  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;

  const email = userRes.user?.email;
  if (!email) {
    throw new Error('NO_AUTH_USER');
  }

  // Re-authenticate with current password (best-effort)
  const { error: signInErr } = await supabase.auth.signInWithPassword({
    email,
    password: input.currentPassword,
  });
  if (signInErr) {
    // Wrong current password, or sign-in blocked
    throw signInErr;
  }

  const { error: updErr } = await supabase.auth.updateUser({ password: input.newPassword });
  if (updErr) throw updErr;

  return { ok: true as const };
}
