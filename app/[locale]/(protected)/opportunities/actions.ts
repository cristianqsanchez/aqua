'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

const TENANT_ID = '10d50f3f-b1b6-4230-b229-37bec3e39ada';

export type Opportunity = {
  id: string;
  opportunity_number: string;
  tenant_id: string;
  account_id: string | null;
  opportunity_name: string;
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  amount: number | null;
  probability: number | null;
  expected_close_date: string | null;
  actual_close_date: string | null;
  lead_source: string | null;
  next_step: string | null;
  description: string | null;
  created_at: string;
  updated_at: string | null;
  account?: {
    account_name: string | null;
    account_number: string | null;
  } | null;
};

type OpportunityRow = {
  id: string;
  opportunity_number: string;
  tenant_id: string;
  account_id: string | null;
  opportunity_name: string;
  stage: string;
  amount: number | null;
  probability: number | null;
  expected_close_date: string | null;
  actual_close_date: string | null;
  lead_source: string | null;
  next_step: string | null;
  description: string | null;
  created_at: string;
  updated_at: string | null;
  account: { account_name: string | null; account_number: string | null }[] | null;
};

function mapRowToOpportunity(row: OpportunityRow): Opportunity {
  return {
    ...row,
    stage: row.stage as Opportunity['stage'],
    account: row.account && row.account.length > 0 ? row.account[0] : null,
  };
}

export async function getOpportunities(): Promise<Opportunity[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('opportunities')
    .select(`
      id,
      opportunity_number,
      tenant_id,
      account_id,
      opportunity_name,
      stage,
      amount,
      probability,
      expected_close_date,
      actual_close_date,
      next_step,
      description,
      created_at,
      updated_at,
      account:accounts(
        account_name,
        account_number
      )
    `)
    .eq('tenant_id', TENANT_ID)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching opportunities:', error);
    throw new Error('Failed to fetch opportunities');
  }

  return (data as OpportunityRow[]).map(mapRowToOpportunity);
}

export async function getOpportunity(id: string): Promise<Opportunity | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('opportunities')
    .select(`
      id,
      opportunity_number,
      tenant_id,
      account_id,
      opportunity_name,
      stage,
      amount,
      probability,
      expected_close_date,
      actual_close_date,
      lead_source,
      next_step,
      description,
      created_at,
      updated_at,
      account:accounts(
        account_name,
        account_number
      )
    `)
    .eq('id', id)
    .eq('tenant_id', TENANT_ID)
    .single();

  if (error) {
    console.error('Error fetching opportunity:', error);
    return null;
  }

  return mapRowToOpportunity(data as OpportunityRow);
}

export async function createOpportunity(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const opportunityName = formData.get('opportunityName') as string;
  const accountId = formData.get('accountId') as string;
  const stage = formData.get('stage') as string;
  const amount = formData.get('amount') as string;
  const probability = formData.get('probability') as string;
  const expectedCloseDate = formData.get('expectedCloseDate') as string;
  const leadSource = formData.get('leadSource') as string;
  const nextStep = formData.get('nextStep') as string;
  const description = formData.get('description') as string;

  const payload = {
    tenant_id: TENANT_ID,
    opportunity_name: opportunityName,
    account_id: accountId || null,
    stage,
    amount: amount ? Number(amount) : null,
    probability: probability ? Number(probability) : null,
    expected_close_date: expectedCloseDate || null,
    lead_source: leadSource || null,
    next_step: nextStep || null,
    description: description || null,
  };

  const { error } = await supabase.from('opportunities').insert(payload);

  if (error) {
    console.error('Error creating opportunity:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/[locale]/opportunities', 'page');
  return { success: true };
}

export async function updateOpportunity(id: string, formData: FormData): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const opportunityName = formData.get('opportunityName') as string;
  const accountId = formData.get('accountId') as string;
  const stage = formData.get('stage') as string;
  const amount = formData.get('amount') as string;
  const probability = formData.get('probability') as string;
  const expectedCloseDate = formData.get('expectedCloseDate') as string;
  const actualCloseDate = formData.get('actualCloseDate') as string;
  const leadSource = formData.get('leadSource') as string;
  const nextStep = formData.get('nextStep') as string;
  const description = formData.get('description') as string;

  const payload = {
    opportunity_name: opportunityName,
    account_id: accountId || null,
    stage,
    amount: amount ? Number(amount) : null,
    probability: probability ? Number(probability) : null,
    expected_close_date: expectedCloseDate || null,
    actual_close_date: actualCloseDate || null,
    lead_source: leadSource || null,
    next_step: nextStep || null,
    description: description || null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('opportunities')
    .update(payload)
    .eq('id', id)
    .eq('tenant_id', TENANT_ID);

  if (error) {
    console.error('Error updating opportunity:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/[locale]/opportunities', 'page');
  return { success: true };
}

export async function deleteOpportunity(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('opportunities')
    .delete()
    .eq('id', id)
    .eq('tenant_id', TENANT_ID);

  if (error) {
    console.error('Error deleting opportunity:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/[locale]/opportunities', 'page');
  return { success: true };
}
