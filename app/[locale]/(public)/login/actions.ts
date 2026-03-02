'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

import { createClient } from '@/lib/supabase/server'
import { defaultLocale } from '@/i18n/config'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const headersList = await headers()
  const locale = headersList.get('x-next-intl-locale') || defaultLocale

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect(`/${locale}/error`)
  }

  revalidatePath('/', 'layout')
  redirect(`/${locale}/dashboard`)
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const headersList = await headers()
  const locale = headersList.get('x-next-intl-locale') || defaultLocale

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect(`/${locale}/error`)
  }

  revalidatePath('/', 'layout')

  redirect(`/${locale}/dashboard`)
}
