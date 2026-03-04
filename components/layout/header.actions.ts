'use server';

import { createClient } from '@/lib/supabase/server';


export async function getHeaderUser() {
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

  return {
    displayName,
    email: user.email ?? '',
  };
}

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
