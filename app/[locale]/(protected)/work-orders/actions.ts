'use server';

import { createClient } from '@/lib/supabase/server';

type WorkOrderStatus =
  | 'draft'
  | 'open'
  | 'assigned'
  | 'in_progress'
  | 'blocked'
  | 'done'
  | 'canceled';

type WorkOrderPriority = 'low' | 'normal' | 'high' | 'urgent';

type WorkOrderListItem = {
  id: string;
  codigo: string;
  title: string;
  project_id: string;
  project_name: string | null;
  type_name: string;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  assigned_to: string | null;
  planned_date: string | null;
  execution_date: string | null;
  created_at: string;
};

type GetWorkOrdersArgs = {
  status?: WorkOrderStatus | null;
  priority?: WorkOrderPriority | null;
  limit?: number;
};

type ProjectOption = {
  id: string;
  project_number: string;
  name: string;
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
};

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function getAuthedUserTenantId(): Promise<string | null> {
  const supabase = await createClient();

  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth?.user?.id) return null;

  const { data: userRow, error } = await supabase

    .from('users')
    .select('tenant_id')
    .eq('id', auth.user.id)
    .maybeSingle();

  if (error) return null;
  return userRow?.tenant_id ?? null;
}

export async function getWorkOrders(args: GetWorkOrdersArgs = {}): Promise<ActionResult<WorkOrderListItem[]>> {
  try {
    const supabase = await createClient();

    const tenantId = await getAuthedUserTenantId();

    const limit = Math.min(Math.max(args.limit ?? 200, 1), 1000);

    // Join: work_orders -> projects (for project name + tenant scope)
    let q = supabase
      .from('work_orders')
      .select(
        `
        id,
        codigo,
        title,
        project_id,
        type_name,
        status,
        priority,

        assigned_to,

        planned_date,
        execution_date,
        created_at,
        project:projects (
          id,
          name,
          tenant_id
        )

      `
      )
      .order('created_at', { ascending: false })
      .limit(limit);

    if (args.status) q = q.eq('status', args.status);
    if (args.priority) q = q.eq('priority', args.priority);


    // Tenant scoping via related project (if we can resolve tenant)
    if (tenantId) {
      // NOTE: Supabase supports filtering on embedded resources using dot notation in many cases.
      // If your PostgREST setup doesn't allow this, we can switch to an RPC for strict tenant scoping.
      q = q.eq('project.tenant_id', tenantId as any);
    }

    const { data, error } = await q;
    if (error) return { ok: false, error: error.message };

    const mapped: WorkOrderListItem[] = (data ?? []).map((row: any) => ({

      id: row.id,
      codigo: row.codigo,
      title: row.title,
      project_id: row.project_id,
      project_name: row.project?.name ?? null,
      type_name: row.type_name,
      status: row.status,
      priority: row.priority,
      assigned_to: row.assigned_to ?? null,

      planned_date: row.planned_date ?? null,
      execution_date: row.execution_date ?? null,
      created_at: row.created_at,
    }));

    return { ok: true, data: mapped };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Unknown error' };
  }

}

async function getTenantIdOrThrow(): Promise<string> {
  const supabase = await createClient();

  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth?.user?.id) throw new Error('Unauthorized');

  const { data: userRow, error } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', auth.user.id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!userRow?.tenant_id) throw new Error('Missing tenant_id');

  return userRow.tenant_id as string;
}

function makeWorkOrderCode(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `OT-${year}-${rand}`;
}

async function upsertWorkOrderExtras(workOrderId: string, extras: Record<string, any>) {
  const supabase = await createClient();
  const key = `work_order:${workOrderId}`;

  const { error } = await supabase
    .from('kv_store_c765fa07')
    .upsert({ key, value: extras }, { onConflict: 'key' });

  if (error) throw new Error(error.message);
}

export async function getActiveProjects(): Promise<ActionResult<ProjectOption[]>> {
  try {
    const supabase = await createClient();
    const tenantId = await getTenantIdOrThrow();

    const { data, error } = await supabase
      .from('projects')
      .select('id, project_number, name, status')
      .eq('tenant_id', tenantId)
      .in('status', ['planning', 'in_progress'])
      .order('updated_at', { ascending: false });

        console.log('DEBUG');
        console.log(data);

    if (error) return { ok: false, error: error.message };

    return {
      ok: true,
      data: (data ?? []) as ProjectOption[],
    };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Unknown error' };
  }
}

type CreateWorkOrderInput = {
  project_id: string;
  title: string;
  type_name: string; // stored in work_orders.type_name
  priority: WorkOrderPriority;
  planned_date: string | null; // mapped to work_orders.planned_date (date)
  extras?: {
    description?: string | null;
    planned_end_at?: string | null;
    location_address?: string | null;
    location_notes?: string | null;
  };
};

export async function createWorkOrder(input: CreateWorkOrderInput): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = await createClient();
    const tenantId = await getTenantIdOrThrow();

    // Validate project belongs to tenant
    const { data: projectRow, error: projectErr } = await supabase
      .from('projects')
      .select('id, tenant_id')
      .eq('id', input.project_id)
      .maybeSingle();

    if (projectErr) return { ok: false, error: projectErr.message };
    if (!projectRow?.id) return { ok: false, error: 'Project not found' };
    if (projectRow.tenant_id !== tenantId) return { ok: false, error: 'Forbidden' };

    // Insert work order (work_orders does not have tenant_id; tenant scoping comes via project_id)
    // codigo is UNIQUE and required.
    let lastErr: string | null = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      const codigo = makeWorkOrderCode();

      const { data: row, error } = await supabase
        .from('work_orders')
        .insert({
          codigo,
          title: input.title,
          project_id: input.project_id,
          type_name: input.type_name,
          status: 'draft' satisfies WorkOrderStatus,
          priority: input.priority,
          planned_date: input.planned_date,
        })
        .select('id')
        .single();

      if (!error && row?.id) {
        if (input.extras && Object.keys(input.extras).length > 0) {
          await upsertWorkOrderExtras(row.id, {
            ...input.extras,
            updated_at: new Date().toISOString(),
          });
        }
        return { ok: true, data: { id: row.id } };
      }

      lastErr = error?.message ?? 'Insert failed';
      // retry on possible unique violation
    }

    return { ok: false, error: lastErr ?? 'Insert failed' };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Unknown error' };
  }
}

function timelineKey(workOrderId: string) {
  return `work_order_timeline:${workOrderId}`;
}

function ensureArray<T>(v: any, fallback: T[] = []): T[] {
  if (Array.isArray(v)) return v as T[];
  return fallback;
}

export async function setWorkOrderStatus(input: {
  work_order_id: string;
  status: Exclude<WorkOrderStatus, 'draft' | 'canceled'>;
}): Promise<ActionResult<{ ok: true }>> {
  try {
    const supabase = await createClient();
    const tenantId = await getTenantIdOrThrow();

    const { data: row, error } = await supabase
      .from('work_orders')
      .select('id, status, project:projects ( id, tenant_id )')
      .eq('id', input.work_order_id)
      .maybeSingle();

    if (error) return { ok: false, error: error.message };
    if (!row?.id) return { ok: false, error: 'Not found' };
    if (row.project?.tenant_id !== tenantId) return { ok: false, error: 'Forbidden' };

    const { error: updErr } = await supabase
      .from('work_orders')
      .update({ status: input.status })
      .eq('id', input.work_order_id);

    if (updErr) return { ok: false, error: updErr.message };

    // timeline append
    const tlKey = timelineKey(input.work_order_id);
    const tl = ensureArray<any>(await getKv(tlKey));
    const auth = await supabase.auth.getUser();
    const createdBy = auth.data?.user?.id ?? null;

    tl.unshift({
      id: crypto.randomUUID(),
      event_type: 'status_changed',
      created_at: new Date().toISOString(),
      created_by: createdBy,
      payload: { from: row.status, to: input.status },
    });

    await upsertKv(tlKey, tl);

    return { ok: true, data: { ok: true } };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Unknown error' };
  }
}
