'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

const TENANT_ID = '10d50f3f-b1b6-4230-b229-37bec3e39ada'

export type Lead = {
  id: string
  lead_number: string
  tenant_id: string
  customer_type: string
  status: string
  source: string | null
  company_name: string | null
  industry: string | null
  website: string | null
  first_name: string | null
  last_name: string | null
  contact_name: string | null
  email: string | null
  phone: string | null
  mobile: string | null
  address: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  country_code: string | null
  interest: string | null
  estimated_value: number | null
  estimated_close_date: string | null
  priority: string
  notes: string | null
  tags: string[] | null
  created_at: string
  updated_at: string | null
}

export async function getLeads(): Promise<Lead[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('tenant_id', TENANT_ID)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching leads:', error)
    throw new Error('Failed to fetch leads')
  }

  return data as Lead[]
}

export async function getLead(id: string): Promise<Lead | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .eq('tenant_id', TENANT_ID)
    .maybeSingle()

  if (error) {
    console.error('Error fetching lead:', error)
    throw new Error('Failed to fetch lead')
  }

  return data as Lead | null
}

export async function createLead(formData: FormData) {
  const supabase = await createClient()

  const payload = {
    tenant_id: TENANT_ID,
    customer_type: formData.get('customer_type') as string,
    status: formData.get('status') as string || 'new',
    source: formData.get('source') as string || null,
    priority: formData.get('priority') as string || 'medium',
    company_name: formData.get('company_name') as string || null,
    industry: formData.get('industry') as string || null,
    website: formData.get('website') as string || null,
    first_name: formData.get('first_name') as string || null,
    last_name: formData.get('last_name') as string || null,
    contact_name: formData.get('contact_name') as string || null,
    email: formData.get('email') as string || null,
    phone: formData.get('phone') as string || null,
    mobile: formData.get('mobile') as string || null,
    address: formData.get('address') as string || null,
    city: formData.get('city') as string || null,
    state: formData.get('state') as string || null,
    postal_code: formData.get('postal_code') as string || null,
    country_code: formData.get('country_code') as string || null,
    interest: formData.get('interest') as string || null,
    estimated_value: formData.get('estimated_value') ? Number(formData.get('estimated_value')) : null,
    estimated_close_date: formData.get('estimated_close_date') as string || null,
    notes: formData.get('notes') as string || null,
    lead_number: `LD-${Date.now()}`,
  }

  const { error } = await supabase.from('leads').insert(payload)

  if (error) {
    console.error('Error creating lead:', error)
    throw new Error('Failed to create lead')
  }

  revalidatePath('/leads')
  return { success: true }
}

export async function updateLead(id: string, formData: FormData) {
  const supabase = await createClient()

  const payload = {
    customer_type: formData.get('customer_type') as string,
    status: formData.get('status') as string,
    source: formData.get('source') as string || null,
    priority: formData.get('priority') as string,
    company_name: formData.get('company_name') as string || null,
    industry: formData.get('industry') as string || null,
    website: formData.get('website') as string || null,
    first_name: formData.get('first_name') as string || null,
    last_name: formData.get('last_name') as string || null,
    contact_name: formData.get('contact_name') as string || null,
    email: formData.get('email') as string || null,
    phone: formData.get('phone') as string || null,
    mobile: formData.get('mobile') as string || null,
    address: formData.get('address') as string || null,
    city: formData.get('city') as string || null,
    state: formData.get('state') as string || null,
    postal_code: formData.get('postal_code') as string || null,
    country_code: formData.get('country_code') as string || null,
    interest: formData.get('interest') as string || null,
    estimated_value: formData.get('estimated_value') ? Number(formData.get('estimated_value')) : null,
    estimated_close_date: formData.get('estimated_close_date') as string || null,
    notes: formData.get('notes') as string || null,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('leads')
    .update(payload)
    .eq('id', id)
    .eq('tenant_id', TENANT_ID)

  if (error) {
    console.error('Error updating lead:', error)
    throw new Error('Failed to update lead')
  }

  revalidatePath('/leads')
  return { success: true }
}

export async function deleteLead(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id)
    .eq('tenant_id', TENANT_ID)

  if (error) {
    console.error('Error deleting lead:', error)
    throw new Error('Failed to delete lead')
  }

  revalidatePath('/leads')
  return { success: true }
}
