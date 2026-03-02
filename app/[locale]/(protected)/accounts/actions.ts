'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'
import { defaultLocale } from '@/i18n/config'

type AccountRow = Database['public']['Tables']['accounts']['Row']
type AccountInsert = Database['public']['Tables']['accounts']['Insert']
type AccountUpdate = Database['public']['Tables']['accounts']['Update']

export type AccountListItem = Pick<
  AccountRow,
  | 'id'
  | 'account_number'
  | 'account_name'
  | 'account_type'
  | 'industry'
  | 'annual_revenue'
  | 'employee_count'
  | 'website'
  | 'phone'
  | 'email'
  | 'billing_city'
  | 'billing_country_code'
  | 'relationship_status'
  | 'created_at'
  | 'updated_at'
>

export type AccountDetails = AccountRow

export type AccountFormValues = {
  locale: string
  accountName: string
  accountType: 'customer' | 'prospect' | 'partner' | 'supplier'
  relationshipStatus: 'active' | 'inactive' | 'prospect' | 'partner'
  industry: string
  annualRevenue: string
  employeeCount: string
  website: string
  phone: string
  email: string
  billingAddress: string
  billingCity: string
  billingState: string
  billingPostalCode: string
  billingCountryCode: string
  shippingSameAsBilling: boolean
  shippingAddress: string
  shippingCity: string
  shippingState: string
  shippingPostalCode: string
  shippingCountryCode: string
  taxId: string
  notes: string
}

export type AccountActionResult =
  | { success: true }
  | { success: false; error: string }

const accountTypeSchema = z.enum(['customer', 'prospect', 'partner', 'supplier'])
const relationshipStatusSchema = z.enum(['active', 'inactive', 'prospect', 'partner'])

const optionalString = z.string().trim().transform((value) => value || null)
const optionalNumberString = z.string().trim().transform((value, ctx) => {
  if (!value) return null

  const parsed = Number(value)
  if (Number.isNaN(parsed)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid number' })
    return z.NEVER
  }

  return parsed
})

const accountFormSchema = z.object({
  locale: z.string().trim().min(1),
  accountName: z.string().trim().min(1, 'Account name is required'),
  accountType: accountTypeSchema,
  relationshipStatus: relationshipStatusSchema,
  industry: optionalString,
  annualRevenue: optionalNumberString,
  employeeCount: optionalNumberString,
  website: optionalString,
  phone: optionalString,
  email: optionalString.pipe(z.union([z.string().email(), z.null()])),
  billingAddress: optionalString,
  billingCity: optionalString,
  billingState: optionalString,
  billingPostalCode: optionalString,
  billingCountryCode: optionalString,
  shippingSameAsBilling: z.boolean(),
  shippingAddress: optionalString,
  shippingCity: optionalString,
  shippingState: optionalString,
  shippingPostalCode: optionalString,
  shippingCountryCode: optionalString,
  taxId: optionalString,
  notes: optionalString,
})

async function getAccountContext() {
  const supabase = await createClient()

  const [{ data: authData, error: authError }, tenantResult] = await Promise.all([
    supabase.auth.getUser(),
    supabase.rpc('current_tenant_id'),
  ])

  if (authError) {
    console.error('Error loading authenticated user:', authError)
    throw new Error('Failed to authenticate user')
  }

  const user = authData.user
  if (!user) {
    throw new Error('User is not authenticated')
  }

  let tenantId = tenantResult.data ?? '10d50f3f-b1b6-4230-b229-37bec3e39ada'

  if (!tenantId) {
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      console.error('Error loading user tenant:', profileError)
      throw new Error('Failed to resolve tenant')
    }

    tenantId = profile?.tenant_id ?? null
  }

  if (!tenantId) {
    throw new Error('Tenant is not configured for the current user')
  }

  return { supabase, tenantId, userId: user.id }
}

function revalidateAccountsPath(locale: string) {
  const localizedPath = locale === defaultLocale ? '/accounts' : `/${locale}/accounts`

  revalidatePath(localizedPath)

  if (locale !== defaultLocale) {
    revalidatePath('/accounts')
  }
}

function buildAccountMutationPayload(
  values: z.infer<typeof accountFormSchema>,
): Pick<
  AccountInsert,
  | 'account_name'
  | 'account_type'
  | 'relationship_status'
  | 'industry'
  | 'annual_revenue'
  | 'employee_count'
  | 'website'
  | 'phone'
  | 'email'
  | 'billing_address'
  | 'billing_city'
  | 'billing_state'
  | 'billing_postal_code'
  | 'billing_country_code'
  | 'shipping_address'
  | 'shipping_city'
  | 'shipping_state'
  | 'shipping_postal_code'
  | 'shipping_country_code'
  | 'tax_id'
  | 'notes'
> {
  return {
    account_name: values.accountName,
    account_type: values.accountType,
    relationship_status: values.relationshipStatus,
    industry: values.industry,
    annual_revenue: values.annualRevenue,
    employee_count: values.employeeCount,
    website: values.website,
    phone: values.phone,
    email: values.email,
    billing_address: values.billingAddress,
    billing_city: values.billingCity,
    billing_state: values.billingState,
    billing_postal_code: values.billingPostalCode,
    billing_country_code: values.billingCountryCode,
    shipping_address: values.shippingSameAsBilling ? values.billingAddress : values.shippingAddress,
    shipping_city: values.shippingSameAsBilling ? values.billingCity : values.shippingCity,
    shipping_state: values.shippingSameAsBilling ? values.billingState : values.shippingState,
    shipping_postal_code: values.shippingSameAsBilling
      ? values.billingPostalCode
      : values.shippingPostalCode,
    shipping_country_code: values.shippingSameAsBilling
      ? values.billingCountryCode
      : values.shippingCountryCode,
    tax_id: values.taxId,
    notes: values.notes,
  }
}

function generateAccountNumber() {
  return `ACC-${Date.now()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`
}

export async function getAccounts(): Promise<AccountListItem[]> {
  const { supabase, tenantId } = await getAccountContext()

  const { data, error } = await supabase
    .from('accounts')
    .select(
      [
        'id',
        'account_number',
        'account_name',
        'account_type',
        'industry',
        'annual_revenue',
        'employee_count',
        'website',
        'phone',
        'email',
        'billing_city',
        'billing_country_code',
        'relationship_status',
        'created_at',
        'updated_at',
      ].join(','),
    )
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching accounts:', error)
    throw new Error('Failed to fetch accounts')
  }

  return data as AccountListItem[]
}

export async function getAccount(id: string): Promise<AccountDetails | null> {
  const { supabase, tenantId } = await getAccountContext()

  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('Error fetching account:', error)
    throw new Error('Failed to fetch account')
  }

  return data as AccountDetails | null
}

export async function createAccount(values: AccountFormValues): Promise<AccountActionResult> {
  const parsed = accountFormSchema.safeParse(values)

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid account data' }
  }

  try {
    const { supabase, tenantId, userId } = await getAccountContext()

    const payload: AccountInsert = {
      ...buildAccountMutationPayload(parsed.data),
      account_number: generateAccountNumber(),
      account_owner_id: userId,
      created_by: userId,
      tenant_id: tenantId,
    }

    const { error } = await supabase.from('accounts').insert(payload)

    if (error) {
      console.error('Error creating account:', error)
      return { success: false, error: 'Failed to create account' }
    }

    revalidateAccountsPath(parsed.data.locale)
    return { success: true }
  } catch (error) {
    console.error('Unexpected error creating account:', error)
    return { success: false, error: 'Failed to create account' }
  }
}

export async function updateAccount(
  id: string,
  values: AccountFormValues,
): Promise<AccountActionResult> {
  const parsed = accountFormSchema.safeParse(values)

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid account data' }
  }

  try {
    const { supabase, tenantId } = await getAccountContext()

    const payload: AccountUpdate = {
      ...buildAccountMutationPayload(parsed.data),
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('accounts')
      .update(payload)
      .eq('tenant_id', tenantId)
      .eq('id', id)

    if (error) {
      console.error('Error updating account:', error)
      return { success: false, error: 'Failed to update account' }
    }

    revalidateAccountsPath(parsed.data.locale)
    return { success: true }
  } catch (error) {
    console.error('Unexpected error updating account:', error)
    return { success: false, error: 'Failed to update account' }
  }
}

export async function deleteAccount(id: string, locale: string): Promise<AccountActionResult> {
  try {
    const { supabase, tenantId } = await getAccountContext()

    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('tenant_id', tenantId)
      .eq('id', id)

    if (error) {
      console.error('Error deleting account:', error)
      return { success: false, error: 'Failed to delete account' }
    }

    revalidateAccountsPath(locale)
    return { success: true }
  } catch (error) {
    console.error('Unexpected error deleting account:', error)
    return { success: false, error: 'Failed to delete account' }
  }
}
