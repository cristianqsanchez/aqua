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

type ChecklistItem = {
  id: string;
  item: string;
  completed: boolean;
  required?: boolean;
  done_at?: string | null;
};

type WorkOrderFile = {
  id: string;
  file_type: string;
  note?: string | null;
  uploaded_at: string;
  url?: string | null;
};

type MaterialRequest = {
  id: string;
  material_name: string;
  qty_requested: number;
  qty_fulfilled: number;

  status: string;
};

type MaterialConsumption = {

  id: string;
  material_name: string;
  qty: number;
  consumed_at: string;
};

type TimelineEvent = {
  id: string;
  event_type: string;
  created_at: string;
  created_by: string | null;
  payload: any;
};


type WorkOrderDetailModel = {
  id: string;
  codigo: string;
  title: string;
  project_id: string;
  project_name: string | null;

  type_name: string;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  assigned_to: string | null;

  planned_start_at: string | null;
  planned_end_at: string | null;
  actual_start_at: string | null;
  actual_end_at: string | null;

  description: string | null;
  technical_notes: string | null;

  location_snapshot: { address?: string | null; notes?: string | null } | null;
  blocked_note: string | null;

  checklist: ChecklistItem[];
  checklist_total: number;
  checklist_completed: number;

  files: WorkOrderFile[];
  material_requests: MaterialRequest[];
  material_consumptions: MaterialConsumption[];
  timeline: TimelineEvent[];
};

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

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

async function getKv(key: string): Promise<any | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('kv_store_c765fa07').select('value').eq('key', key).maybeSingle();
  if (error) return null;
  return data?.value ?? null;
}

async function upsertKv(key: string, value: any) {
  const supabase = await createClient();
  const { error } = await supabase.from('kv_store_c765fa07').upsert({ key, value }, { onConflict: 'key' });
  if (error) throw new Error(error.message);
}

function mustOwnWorkOrderKey(workOrderId: string) {
  return `work_order:${workOrderId}`;
}

function checklistKey(workOrderId: string) {
  return `work_order_checklist:${workOrderId}`;
}

function filesKey(workOrderId: string) {
  return `work_order_files:${workOrderId}`;
}

function materialsReqKey(workOrderId: string) {
  return `work_order_material_requests:${workOrderId}`;
}

function materialsConsKey(workOrderId: string) {
  return `work_order_material_consumptions:${workOrderId}`;

}

function timelineKey(workOrderId: string) {
  return `work_order_timeline:${workOrderId}`;
}

function ensureArray<T>(v: any, fallback: T[] = []): T[] {
  if (Array.isArray(v)) return v as T[];
  return fallback;
}

function safeString(v: any): string | null {
  if (typeof v === 'string' && v.length > 0) return v;
  return null;
}


export async function getWorkOrderDetail(workOrderId: string): Promise<ActionResult<WorkOrderDetailModel>> {
  try {
    const supabase = await createClient();
    const tenantId = await getTenantIdOrThrow();

    const { data: row, error } = await supabase
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
      .eq('id', workOrderId)
      .maybeSingle();

    if (error) return { ok: false, error: error.message };
    if (!row?.id) return { ok: false, error: 'Not found' };
    if (row.project?.tenant_id !== tenantId) return { ok: false, error: 'Forbidden' };

    const extras = await getKv(mustOwnWorkOrderKey(workOrderId));
    const checklist = ensureArray<ChecklistItem>(await getKv(checklistKey(workOrderId)));
    const files = ensureArray<WorkOrderFile>(await getKv(filesKey(workOrderId)));
    const material_requests = ensureArray<MaterialRequest>(await getKv(materialsReqKey(workOrderId)));
    const material_consumptions = ensureArray<MaterialConsumption>(await getKv(materialsConsKey(workOrderId)));
    const timeline = ensureArray<TimelineEvent>(await getKv(timelineKey(workOrderId)));

    const planned_start_at = safeString(extras?.planned_date ?? extras?.planned_start_at) ?? safeString(row.planned_date);
    const planned_end_at = safeString(extras?.planned_end_at) ?? null;

    const actual_start_at = safeString(extras?.actual_start_at) ?? null;
    const actual_end_at = safeString(extras?.actual_end_at) ?? safeString(row.execution_date);


    const completedCount = checklist.filter((x) => !!x.completed).length;

    const detail: WorkOrderDetailModel = {
      id: row.id,
      codigo: row.codigo,
      title: row.title,
      project_id: row.project_id,
      project_name: row.project?.name ?? null,
      type_name: row.type_name,
      status: row.status,
      priority: row.priority,
      assigned_to: row.assigned_to ?? null,

      planned_start_at,
      planned_end_at,
      actual_start_at,
      actual_end_at,

      description: safeString(extras?.description) ?? null,
      technical_notes: safeString(extras?.technical_notes ?? extras?.notas_tecnicas) ?? null,

      location_snapshot: extras?.location_address || extras?.location_notes
        ? {
            address: safeString(extras?.location_address) ?? null,
            notes: safeString(extras?.location_notes) ?? null,
          }
        : null,

      blocked_note: safeString(extras?.blocked_note) ?? null,

      checklist,
      checklist_total: checklist.length,
      checklist_completed: completedCount,

      files,
      material_requests,
      material_consumptions,
      timeline,
    };

    return { ok: true, data: detail };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Unknown error' };
  }
}

type SetChecklistItemInput = {
  work_order_id: string;
  item_id: string;
  completed: boolean;
};

export async function setWorkOrderChecklistItem(
  input: SetChecklistItemInput
): Promise<ActionResult<{ ok: true }>> {
  try {
    const supabase = await createClient();
    const tenantId = await getTenantIdOrThrow();

    // authorize via project tenant
    const { data: row, error } = await supabase
      .from('work_orders')
      .select(
        `
        id,
        project_id,
        project:projects ( id, tenant_id )
      `
      )
      .eq('id', input.work_order_id)
      .maybeSingle();

    if (error) return { ok: false, error: error.message };
    if (!row?.id) return { ok: false, error: 'Not found' };
    if (row.project?.tenant_id !== tenantId) return { ok: false, error: 'Forbidden' };

    const key = checklistKey(input.work_order_id);
    const current = ensureArray<ChecklistItem>(await getKv(key));

    const next = current.map((it) =>
      it.id === input.item_id
        ? { ...it, completed: input.completed, done_at: input.completed ? new Date().toISOString() : null }
        : it
    );

    await upsertKv(key, next);

    // append timeline
    const tlKey = timelineKey(input.work_order_id);
    const tl = ensureArray<TimelineEvent>(await getKv(tlKey));
    const auth = await supabase.auth.getUser();
    const createdBy = auth.data?.user?.id ?? null;

    tl.unshift({
      id: crypto.randomUUID(),
      event_type: input.completed ? 'checklist_completed' : 'checklist_unchecked',
      created_at: new Date().toISOString(),
      created_by: createdBy,
      payload: { item_id: input.item_id, completed: input.completed },
    });

    await upsertKv(tlKey, tl);

    return { ok: true, data: { ok: true } };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Unknown error' };
  }
}
