'use server';

import { createClient } from '@/lib/supabase/server';

type ProjectListRow = {
  id: string;
  project_number: string;
  name: string;
  status: string | null;
  project_type: string | null;
  planned_end_date: string | null;
  progress_percent: number | null;
  budget: number | null;
  actual_cost: number | null;
  customer_name: string | null;
};

export async function getProjectsList(): Promise<ProjectListRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('projects')
    .select(
      `
      id,
      project_number,
      name,
      status,
      project_type,
      planned_end_date,
      progress_percent,
      budget,
      actual_cost,
      customers:customer_id (
        company_name,
        contact_name,
        first_name,
        last_name
      )
    `
    )
    .order('created_at', { ascending: false });

  if (error) throw error;


  return (data ?? []).map((row: any) => {
    const c = row.customers;


    const customer_name =
      c?.company_name ??
      c?.contact_name ??
      [c?.first_name, c?.last_name].filter(Boolean).join(' ') ??
      null;

    return {
      id: row.id,
      project_number: row.project_number,
      name: row.name,
      status: row.status,
      project_type: row.project_type,
      planned_end_date: row.planned_end_date,
      progress_percent: row.progress_percent,
      budget: row.budget,
      actual_cost: row.actual_cost,
      customer_name,
    };
  });
}

export async function createProject(input: {
  name: string;
  customer_id: string;
  project_type: 'new_construction' | 'renovation' | 'maintenance' | 'repair';
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  start_date: string | null;
  planned_end_date: string | null;
  branch_id: string | null;
  site_address: string | null;
  description: string | null;
  currency_code: string;
  budget: number;
}) {
  const supabase = await createClient();

  const { data: tenantData, error: tenantErr } = await supabase
    .from('tenants')
    .select('id')
    .limit(1)
    .maybeSingle();

  if (tenantErr) throw tenantErr;
  if (!tenantData?.id) throw new Error('Missing tenant context');

  // project_number is required by schema; use a simple sequential-like placeholder (timestamp-based)
  const project_number = `PRJ-${Date.now()}`;

  const { error } = await supabase.from('projects').insert({
    tenant_id: tenantData.id,
    branch_id: input.branch_id,
    customer_id: input.customer_id,
    project_number,
    name: input.name,
    description: input.description,
    project_type: input.project_type,
    site_address: input.site_address,
    status: input.status,
    start_date: input.start_date,
    planned_end_date: input.planned_end_date,
    currency_code: input.currency_code,
    budget: input.budget,
    progress_percent: 0,
  });

  if (error) throw error;
}

export async function updateProject(
  projectId: string,
  patch: {
    status?: string;
  }
) {
  const supabase = await createClient();


  const { error } = await supabase
    .from('projects')
    .update(patch)
    .eq('id', projectId);

  if (error) throw error;
}

export async function getCustomersForClientSelector(): Promise<
  Array<{
    id: string;
    display_name: string;
    customer_type: 'individual' | 'company' | null;
    status: 'prospect' | 'active' | 'inactive' | 'vip' | null;
    email: string | null;
    phone: string | null;
    mobile: string | null;
  }>
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('customers')
    .select('id, customer_type, status, company_name, contact_name, first_name, last_name, email, phone, mobile')
    .order('created_at', { ascending: false })
    .limit(300);

  if (error) throw error;

  return (data ?? []).map((c) => {
    const display_name =
      c.company_name ??
      c.contact_name ??
      [c.first_name, c.last_name].filter(Boolean).join(' ') ??
      c.id;

    return {
      id: c.id,
      display_name,
      customer_type: c.customer_type ?? null,
      status: c.status ?? null,
      email: c.email ?? null,
      phone: c.phone ?? null,
      mobile: c.mobile ?? null,
    };
  });
}

export async function getBranchesForSelect(): Promise<Array<{ id: string; name: string }>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('branches')
    .select('id, name')
    .order('is_headquarters', { ascending: false })
    .order('name', { ascending: true })
    .limit(200);

  if (error) throw error;

  return (data ?? []).map((b) => ({ id: b.id, name: b.name }));
}

export async function getProjectForEdit(projectId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('projects')
    .select(
      `
      id,
      project_number,
      name,
      customer_id,
      project_type,
      status,
      budget,
      actual_cost,
      currency_code,
      start_date,
      planned_end_date,
      branch_id,
      description,
      site_address,
      progress_percent
    `
    )
    .eq('id', projectId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Project not found');

  return data;
}

export async function updateProjectForEdit(
  projectId: string,
  patch: Partial<{
    name: string;
    customer_id: string;
    project_type: 'new_construction' | 'renovation' | 'maintenance' | 'repair';
    status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
    budget: number;
    currency_code: string;
    start_date: string | null;
    planned_end_date: string | null;
    branch_id: string | null;
    description: string | null;
    site_address: string | null;
    progress_percent: number;
  }>
) {
  const supabase = await createClient();

  const { error } = await supabase.from('projects').update(patch).eq('id', projectId);
  if (error) throw error;
}

export async function getProjectDetail(projectId: string) {
  const supabase = await createClient();

  const { data: project, error } = await supabase
    .from('projects')
    .select(
      `
      id,
      project_number,
      name,
      customer_id,
      branch_id,
      project_type,
      status,
      start_date,
      planned_end_date,
      actual_end_date,
      currency_code,
      budget,
      actual_cost,
      progress_percent,
      description,
      site_address,
      project_manager_id
    `
    )
    .eq('id', projectId)
    .maybeSingle();

  if (error) throw error;
  if (!project) throw new Error('Project not found');

  // customer display name
  let customer_display_name: string | null = null;
  if (project.customer_id) {
    const { data: c, error: ce } = await supabase
      .from('customers')
      .select('company_name, contact_name, first_name, last_name')
      .eq('id', project.customer_id)
      .maybeSingle();

    if (ce) throw ce;

    if (c) {
      customer_display_name =
        c.company_name ??
        c.contact_name ??
        [c.first_name, c.last_name].filter(Boolean).join(' ') ??
        null;
    }
  }

  // branch name
  let branch_name: string | null = null;
  if (project.branch_id) {
    const { data: b, error: be } = await supabase.from('branches').select('name').eq('id', project.branch_id).maybeSingle();
    if (be) throw be;
    branch_name = b?.name ?? null;
  }

  // project manager name
  let project_manager_name: string | null = null;
  if (project.project_manager_id) {
    const { data: u, error: ue } = await supabase.from('users').select('full_name').eq('id', project.project_manager_id).maybeSingle();
    if (ue) throw ue;
    project_manager_name = u?.full_name ?? null;
  }

  return {
    ...project,
    customer_display_name,
    branch_name,
    project_manager_name,
  };
}

export async function setProjectStatus(
  projectId: string,
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled'
) {
  const supabase = await createClient();

  const { error } = await supabase.from('projects').update({ status }).eq('id', projectId);
  if (error) throw error;
}

export async function getProjectsForGantt() {
  const supabase = await createClient();

  const { data: projects, error } = await supabase
    .from('projects')
    .select(
      `
      id,
      project_number,
      name,
      customer_id,
      branch_id,
      status,
      start_date,
      planned_end_date,
      progress_percent,
      project_manager_id
    `
    )
    .order('start_date', { ascending: true });

  if (error) throw error;

  const list = projects ?? [];

  const customerIds = Array.from(new Set(list.map((p) => p.customer_id).filter(Boolean))) as string[];
  const branchIds = Array.from(new Set(list.map((p) => p.branch_id).filter(Boolean))) as string[];
  const pmIds = Array.from(new Set(list.map((p) => p.project_manager_id).filter(Boolean))) as string[];

  const [customersRes, branchesRes, usersRes] = await Promise.all([
    customerIds.length
      ? supabase.from('customers').select('id, company_name, contact_name, first_name, last_name').in('id', customerIds)
      : Promise.resolve({ data: [], error: null } as any),
    branchIds.length ? supabase.from('branches').select('id, name').in('id', branchIds) : Promise.resolve({ data: [], error: null } as any),
    pmIds.length ? supabase.from('users').select('id, full_name').in('id', pmIds) : Promise.resolve({ data: [], error: null } as any),
  ]);

  if (customersRes.error) throw customersRes.error;
  if (branchesRes.error) throw branchesRes.error;
  if (usersRes.error) throw usersRes.error;

  const customers = new Map<string, string>();
  for (const c of customersRes.data ?? []) {
    const display =
      c.company_name ??
      c.contact_name ??
      [c.first_name, c.last_name].filter(Boolean).join(' ') ??
      null;
    if (display) customers.set(c.id, display);
  }

  const branches = new Map<string, string>();
  for (const b of branchesRes.data ?? []) {
    if (b?.name) branches.set(b.id, b.name);
  }

  const users = new Map<string, string>();
  for (const u of usersRes.data ?? []) {
    if (u?.full_name) users.set(u.id, u.full_name);
  }

  return list.map((p) => ({
    id: p.id,
    project_number: p.project_number ?? null,
    name: p.name ?? null,
    customer_display_name: p.customer_id ? customers.get(p.customer_id) ?? null : null,
    branch_id: p.branch_id ?? null,
    branch_name: p.branch_id ? branches.get(p.branch_id) ?? null : null,
    status: (p.status ?? 'planning') as any,
    start_date: p.start_date ?? null,
    planned_end_date: p.planned_end_date ?? null,
    progress_percent: p.progress_percent ?? 0,
    project_manager_name: p.project_manager_id ? users.get(p.project_manager_id) ?? null : null,
  }));
}
