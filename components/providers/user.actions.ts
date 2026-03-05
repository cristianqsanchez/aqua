'use server';

import { createClient } from '@/lib/supabase/server';

export async function getUser() {
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

  return {
    displayName,
    email: user.email ?? '',
    roleLabel: role || undefined,
  };
}

export async function getHeaderUser() {
  const user = await getUser();
  if (!user) return null;
  return {
    displayName: user.displayName,
    email: user.email,
  };
}
