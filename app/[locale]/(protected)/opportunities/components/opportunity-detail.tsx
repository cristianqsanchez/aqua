'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  DollarSign,

  Calendar,
  User,
  FileText,
  CheckCircle2,
  Edit,
  Save,
  X,
  Waves,

  Clock,
  Upload,
  Download,
  Trash2,
  Plus,

  MessageSquare,
  MoreVertical,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { useLocale, useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { PoolTechnicalConfig } from '@/components/sales/pool-technical-config';
import { ClientSelector } from '@/components/sales/client-selector';

interface OpportunityDetailProps {
  opportunityId: string;
  onBack: () => void;
  onCreateQuotation: () => void;
  onViewQuotation?: (quotationId: string) => void;
  onGenerateContract?: () => void;
}

const TENANT_ID = '10d50f3f-b1b6-4230-b229-37bec3e39ada';

type OpportunityRow = {
  id: string;
  tenant_id: string;
  opportunity_number: string | null;
  opportunity_name: string | null;
  account_id: string | null;
  stage: string | null;
  amount: number | null;
  probability: number | null;
  expected_close_date: string | null;
  actual_close_date: string | null;
  lead_source: string | null;
  next_step: string | null;
  description: string | null;
  address: string | null;
  notes: string | null;
  assigned_to: string | null;
  created_at: string;
};

type AccountOption = { id: string; account_name: string | null; account_number: string | null };

type Quotation = {
  id: string;
  number: string;
  version: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  amount: number;
  currency: string;
  validUntil: string;
  createdAt: string;
  createdBy: string;
};

type Activity = {
  id: string;
  type: 'note' | 'call' | 'email' | 'meeting';
  title: string;
  description: string;
  createdBy: string;
  createdAt: string;
};

type FileItem = {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
};

const MOCK_QUOTATIONS: Quotation[] = [
  {
    id: '1',
    number: 'COT-2026-001',
    version: 'v1.0',
    status: 'sent',
    amount: 45000,
    currency: 'EUR',
    validUntil: '2026-03-15',
    createdAt: '2026-02-10',
    createdBy: 'Carlos Martínez',
  },
  {
    id: '2',
    number: 'COT-2026-001',
    version: 'v1.1',
    status: 'accepted',
    amount: 42500,
    currency: 'EUR',
    validUntil: '2026-03-20',
    createdAt: '2026-02-18',
    createdBy: 'Carlos Martínez',
  },
];

const MOCK_ACTIVITIES: Activity[] = [
  {
    id: '1',
    type: 'note',
    title: 'Nota agregada',
    description: 'Cliente interesado en modelo Pool & Play 8x4',
    createdBy: 'Carlos Martínez',
    createdAt: '2026-02-20 14:30',
  },
  {
    id: '2',
    type: 'call',
    title: 'Llamada telefónica',
    description: 'Llamada de seguimiento - Cliente confirma interés',
    createdBy: 'Carlos Martínez',
    createdAt: '2026-02-18 10:15',
  },
  {
    id: '3',
    type: 'email',
    title: 'Email enviado',
    description: 'Cotización enviada por email',
    createdBy: 'Sistema',
    createdAt: '2026-02-15 16:45',
  },
  {
    id: '4',
    type: 'meeting',
    title: 'Reunión agendada',
    description: 'Visita al sitio del proyecto programada',
    createdBy: 'Carlos Martínez',
    createdAt: '2026-02-12 09:00',
  },
];

const MOCK_FILES: FileItem[] = [
  { id: '1', name: 'Plano del terreno.pdf', type: 'pdf', size: '2.4 MB', uploadedBy: 'Juan Pérez', uploadedAt: '2026-02-15' },
  { id: '2', name: 'Fotos del sitio.zip', type: 'zip', size: '15.8 MB', uploadedBy: 'Carlos Martínez', uploadedAt: '2026-02-12' },
  { id: '3', name: 'Documentación legal.pdf', type: 'pdf', size: '1.2 MB', uploadedBy: 'Juan Pérez', uploadedAt: '2026-02-10' },
];

export function OpportunityDetail({
  opportunityId,
  onBack,
  onCreateQuotation,
  onViewQuotation,
  onGenerateContract,
}: OpportunityDetailProps) {
  const t = useTranslations('opportunities.detail');
  const locale = useLocale();

  const [opportunity, setOpportunity] = useState<OpportunityRow | null>(null);
  const [account, setAccount] = useState<AccountOption | null>(null);

  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<Partial<OpportunityRow>>({});
  const [showTechnicalConfig, setShowTechnicalConfig] = useState(false);
  const [activeTab, setActiveTab] = useState<'resumen' | 'actividades' | 'cotizaciones' | 'archivos' | 'historial'>('resumen');

  const [showNewActivityDialog, setShowNewActivityDialog] = useState(false);
  const [newActivity, setNewActivity] = useState<{ type: Activity['type']; title: string; description: string }>({
    type: 'note',

    title: '',
    description: '',
  });

  const [quotations] = useState<Quotation[]>(MOCK_QUOTATIONS);
  const [activities, setActivities] = useState<Activity[]>(MOCK_ACTIVITIES);
  const [files] = useState<FileItem[]>(MOCK_FILES);

  const QUOTATION_STATUS_CONFIG = useMemo(
    () => ({
      draft: { label: t('quotation.status.draft'), color: 'bg-muted text-foreground border-border' },
      sent: { label: t('quotation.status.sent'), color: 'bg-muted text-foreground border-border' },
      accepted: { label: t('quotation.status.accepted'), color: 'bg-muted text-foreground border-border' },
      rejected: { label: t('quotation.status.rejected'), color: 'bg-muted text-foreground border-border' },
      expired: { label: t('quotation.status.expired'), color: 'bg-muted text-foreground border-border' },
    }),
    [t]
  );

  const stages = useMemo(
    () => [
      { id: 'lead', label: t('progress.lead'), completed: true },
      { id: 'qualified', label: t('progress.qualified'), completed: true },
      { id: 'proposal', label: t('progress.proposal'), completed: true },
      { id: 'negotiation', label: t('progress.negotiation'), completed: false },
      { id: 'won', label: t('progress.won'), completed: false },
    ],
    [t]
  );

  useEffect(() => {
    void loadOpportunity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opportunityId]);

  const loadOpportunity = async () => {
    const supabase = createClient();

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('opportunities')
        .select(
          'id,tenant_id,opportunity_number,opportunity_name,account_id,stage,amount,probability,expected_close_date,actual_close_date,lead_source,next_step,description,address,notes,assigned_to,created_at'
        )
        .eq('id', opportunityId)
        .eq('tenant_id', TENANT_ID)
        .single();

      if (error) throw error;

      const row = (data ?? null) as OpportunityRow | null;
      setOpportunity(row);
      setFormData(row ?? {});

      if (row?.account_id) {
        const { data: acc, error: accErr } = await supabase
          .from('accounts')
          .select('id,account_name,account_number')
          .eq('id', row.account_id)

          .eq('tenant_id', TENANT_ID)
          .single();

        if (!accErr) setAccount((acc ?? null) as AccountOption | null);
      } else {
        setAccount(null);
      }
    } catch (error) {
      console.error('Error loading opportunity:', error);
      toast.error(t('toasts.loadError'));
      setOpportunity(null);
      setFormData({});
      setAccount(null);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof OpportunityRow, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatDate = (dateStr?: string | null) => {

    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '-';
    return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: '2-digit' }).format(d);

  };


  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '-';
    return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(d);
  };

  const formatCurrency = (value?: number | null, currency = 'EUR') => {
    if (value == null) return '-';
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
  };

  const stageLabel = (stage?: string | null) => {

    switch (stage) {
      case 'qualified':
        return t('stages.qualified');
      case 'proposal':
        return t('stages.proposal');
      case 'negotiation':
        return t('stages.negotiation');
      case 'won':
      case 'closed_won':
        return t('stages.won');
      case 'closed_lost':
        return t('stages.lost');
      case 'prospecting':
        return t('stages.prospecting');
      case 'qualification':
        return t('stages.qualification');
      default:
        return t('stages.unknown');
    }
  };

  const handleSave = async () => {
    const supabase = createClient();

    try {
      setSaving(true);


      const update = {
        opportunity_name: (formData.opportunity_name ?? null) as string | null,
        stage: (formData.stage ?? null) as string | null,
        amount: formData.amount == null || formData.amount === '' ? null : Number(formData.amount),
        probability: formData.probability == null || formData.probability === '' ? null : Number(formData.probability),
        expected_close_date: (formData.expected_close_date ?? null) as string | null,
        actual_close_date: (formData.actual_close_date ?? null) as string | null,
        address: (formData.address ?? null) as string | null,
        notes: (formData.notes ?? null) as string | null,
        account_id: (formData.account_id ?? null) as string | null,
      };


      const { error } = await supabase.from('opportunities').update(update).eq('id', opportunityId).eq('tenant_id', TENANT_ID);
      if (error) throw error;

      toast.success(t('toasts.updated'));
      setIsEditing(false);

      await loadOpportunity();
    } catch (error) {
      console.error('Error updating opportunity:', error);
      toast.error(t('toasts.updateError'));
    } finally {

      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(opportunity ?? {});
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">{t('loading')}</div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">{t('notFound')}</p>
        <Button onClick={onBack}>{t('actions.back')}</Button>

      </div>
    );
  }

  const projectTitle = opportunity.opportunity_name ?? t('labels.untitled');
  const clientName = account?.account_name ?? t('labels.noClient');

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            {t('actions.back')}
          </Button>
          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              {t('header.title', { project: projectTitle, client: clientName })}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">{t('header.id', { id: opportunityId })}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="ghost" onClick={handleCancel} disabled={saving}>
                <X className="w-4 h-4 mr-2" />
                {t('actions.cancel')}
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? t('actions.saving') : t('actions.save')}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />
              {t('actions.edit')}
            </Button>
          )}
        </div>
      </div>

      {/* Progress Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>{t('progress.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {stages.map((stage, index) => (
              <div key={stage.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={[
                      'w-10 h-10 rounded-full flex items-center justify-center border-2',
                      stage.completed ? 'bg-primary border-primary' : 'bg-background border-border',
                    ].join(' ')}
                  >
                    {stage.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-muted-foreground/40" />
                    )}
                  </div>
                  <span className={['text-xs mt-2 font-medium', stage.completed ? 'text-foreground' : 'text-muted-foreground'].join(' ')}>
                    {stage.label}
                  </span>
                </div>
                {index < stages.length - 1 && (
                  <div className={['flex-1 h-0.5 mx-2', stage.completed ? 'bg-primary' : 'bg-border'].join(' ')} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="resumen">{t('tabs.summary')}</TabsTrigger>
          <TabsTrigger value="actividades">{t('tabs.activities')}</TabsTrigger>
          <TabsTrigger value="cotizaciones">{t('tabs.quotations')}</TabsTrigger>
          <TabsTrigger value="archivos">{t('tabs.files')}</TabsTrigger>
          <TabsTrigger value="historial">{t('tabs.history')}</TabsTrigger>
        </TabsList>

        {/* Resumen */}
        <TabsContent value="resumen" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('summary.detailsCard')}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{t('summary.client')}</Label>

                          <ClientSelector
                            value={(formData.account_id ?? '') as string}
                            onValueChange={(id, _name) => handleChange('account_id', id)}
                            placeholder={t('summary.clientPlaceholder')}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>{t('summary.stage')}</Label>
                          <Select value={(formData.stage ?? '') as string} onValueChange={(value) => handleChange('stage', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="qualified">{t('stages.qualified')}</SelectItem>
                              <SelectItem value="proposal">{t('stages.proposal')}</SelectItem>
                              <SelectItem value="negotiation">{t('stages.negotiation')}</SelectItem>
                              <SelectItem value="won">{t('stages.won')}</SelectItem>
                              <SelectItem value="closed_lost">{t('stages.lost')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>{t('summary.amount')}</Label>
                          <Input
                            type="number"
                            value={(formData.amount ?? '') as any}
                            onChange={(e) => handleChange('amount', e.target.value === '' ? null : Number(e.target.value))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>{t('summary.probability')}</Label>

                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={(formData.probability ?? '') as any}
                            onChange={(e) => handleChange('probability', e.target.value === '' ? null : Number(e.target.value))}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>{t('summary.address')}</Label>
                        <Input value={(formData.address ?? '') as string} onChange={(e) => handleChange('address', e.target.value)} />
                      </div>

                      <div className="space-y-2">
                        <Label>{t('summary.notes')}</Label>
                        <Textarea value={(formData.notes ?? '') as string} onChange={(e) => handleChange('notes', e.target.value)} rows={4} />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">{t('summary.client')}</p>
                          <p className="font-medium text-foreground">{clientName}</p>

                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground">{t('summary.currentStage')}</p>
                          <Badge variant="outline" className="bg-muted text-foreground border-border">
                            {stageLabel(opportunity.stage)}
                          </Badge>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground">{t('summary.assignedTo')}</p>
                          <p className="font-medium text-foreground">{opportunity.assigned_to ?? '-'}</p>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground">{t('summary.closeProbability')}</p>
                          <p className="font-medium text-foreground">{opportunity.probability ?? 0}%</p>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <p className="text-sm text-muted-foreground mb-2">{t('summary.address')}</p>
                        <p className="font-medium text-foreground">{opportunity.address ?? t('labels.notSpecified')}</p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-2">{t('summary.amount')}</p>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-muted-foreground" />
                          <span className="text-2xl font-bold text-foreground">{formatCurrency(opportunity.amount ?? 0, 'EUR')}</span>
                        </div>
                      </div>

                      {!!opportunity.notes && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">{t('summary.notes')}</p>
                          <p className="text-sm text-foreground">{opportunity.notes}</p>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('summary.quickInfo')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">{t('summary.created')}</p>
                      <p className="text-sm font-medium text-foreground">{formatDate(opportunity.created_at)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">{t('summary.owner')}</p>
                      <p className="text-sm font-medium text-foreground">{opportunity.assigned_to ?? '-'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('summary.quickActions')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="default" className="w-full justify-start" onClick={() => setShowTechnicalConfig(true)}>
                    <Waves className="w-4 h-4 mr-2" />
                    {t('summary.technicalConfig')}

                  </Button>

                  <Button variant="outline" className="w-full justify-start" onClick={onCreateQuotation}>
                    <FileText className="w-4 h-4 mr-2" />
                    {t('summary.newQuotation')}
                  </Button>

                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    {t('summary.scheduleMeeting')}
                  </Button>

                  {!!onGenerateContract && (
                    <Button variant="outline" className="w-full justify-start" onClick={onGenerateContract}>
                      <FileText className="w-4 h-4 mr-2" />
                      {t('summary.generateContract')}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>


        {/* Actividades */}
        <TabsContent value="actividades" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('activities.title')}</CardTitle>
              <Button size="sm" onClick={() => setShowNewActivityDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t('activities.new')}
              </Button>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex gap-4 border-l-2 border-border pl-4 py-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        <span className="font-medium text-sm text-foreground">{activity.title}</span>
                        <Badge variant="outline" className="text-xs bg-muted text-foreground border-border">
                          {activity.type === 'note'
                            ? t('activities.types.note')
                            : activity.type === 'call'
                              ? t('activities.types.call')
                              : activity.type === 'email'
                                ? t('activities.types.email')
                                : t('activities.types.meeting')}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground">{activity.description}</p>

                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <User className="w-3 h-3" />
                        <span>{activity.createdBy}</span>
                        <span>•</span>
                        <Clock className="w-3 h-3" />
                        <span>{activity.createdAt}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cotizaciones */}
        <TabsContent value="cotizaciones" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t('quotation.title')}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{t('quotation.subtitle')}</p>
              </div>
              <Button onClick={onCreateQuotation}>
                <Plus className="w-4 h-4 mr-2" />
                {t('quotation.new')}
              </Button>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('quotation.table.number')}</TableHead>
                    <TableHead>{t('quotation.table.version')}</TableHead>
                    <TableHead>{t('quotation.table.status')}</TableHead>
                    <TableHead>{t('quotation.table.amount')}</TableHead>
                    <TableHead>{t('quotation.table.validUntil')}</TableHead>
                    <TableHead>{t('quotation.table.createdAt')}</TableHead>
                    <TableHead>{t('quotation.table.createdBy')}</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {quotations.map((q) => (
                    <TableRow key={q.id} className="hover:bg-muted/40">
                      <TableCell className="font-medium text-foreground">{q.number}</TableCell>

                      <TableCell>
                        <Badge variant="outline" className="bg-muted text-foreground border-border">
                          {q.version}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className={QUOTATION_STATUS_CONFIG[q.status].color}>
                          {QUOTATION_STATUS_CONFIG[q.status].label}
                        </Badge>
                      </TableCell>

                      <TableCell className="font-semibold text-foreground">{formatCurrency(q.amount, q.currency)}</TableCell>

                      <TableCell className="text-sm text-muted-foreground">{formatDate(q.validUntil)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(q.createdAt)}</TableCell>
                      <TableCell className="text-sm text-foreground">{q.createdBy}</TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onViewQuotation?.(q.id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              {t('quotation.actions.viewEdit')}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => {
                                toast.success(t('quotation.actions.downloading', { number: q.number, version: q.version }));
                              }}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              {t('quotation.actions.downloadPdf')}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                if (confirm(t('quotation.actions.deleteConfirm', { number: q.number, version: q.version }))) {
                                  toast.success(t('quotation.actions.deleted'));
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t('quotation.actions.delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Archivos */}
        <TabsContent value="archivos" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('files.title')}</CardTitle>
              <Button size="sm">
                <Upload className="w-4 h-4 mr-2" />
                {t('files.upload')}
              </Button>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('files.table.name')}</TableHead>
                    <TableHead>{t('files.table.type')}</TableHead>
                    <TableHead>{t('files.table.size')}</TableHead>
                    <TableHead>{t('files.table.uploadedBy')}</TableHead>
                    <TableHead>{t('files.table.uploadedAt')}</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {files.map((f) => (
                    <TableRow key={f.id} className="hover:bg-muted/40">
                      <TableCell className="font-medium text-foreground">{f.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="uppercase bg-muted text-foreground border-border">
                          {f.type}
                        </Badge>

                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{f.size}</TableCell>
                      <TableCell className="text-sm text-foreground">{f.uploadedBy}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(f.uploadedAt)}</TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              {t('files.actions.download')}
                            </DropdownMenuItem>

                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              {t('files.actions.view')}
                            </DropdownMenuItem>

                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t('files.actions.delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Historial */}
        <TabsContent value="historial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('history.title')}</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3 border-l-2 border-primary pl-4">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{t('history.items.accepted')}</p>
                    <p className="text-xs text-muted-foreground">{t('history.meta', { by: 'Carlos Martínez', at: '2026-02-20 15:30' })}</p>
                  </div>
                </div>

                <div className="flex gap-3 border-l-2 border-border pl-4">
                  <div className="w-2 h-2 bg-border rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{t('history.items.createdV11')}</p>
                    <p className="text-xs text-muted-foreground">{t('history.meta', { by: 'Carlos Martínez', at: '2026-02-18 10:15' })}</p>
                  </div>
                </div>

                <div className="flex gap-3 border-l-2 border-border pl-4">
                  <div className="w-2 h-2 bg-border rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{t('history.items.sentV10')}</p>
                    <p className="text-xs text-muted-foreground">{t('history.meta', { by: 'Sistema', at: '2026-02-10 16:45' })}</p>
                  </div>
                </div>

                <div className="flex gap-3 border-l-2 border-border pl-4">
                  <div className="w-2 h-2 bg-border rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{t('history.items.opportunityCreated')}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(opportunity.created_at)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal Configuración Técnica */}
      <PoolTechnicalConfig
        open={showTechnicalConfig}
        onOpenChange={setShowTechnicalConfig}
        leadId={opportunityId}
        onSuccess={(config) => {
          console.log('Configuración guardada:', config);
          toast.success(t('toasts.technicalSaved'));
        }}
      />

      {/* Modal Nueva Actividad */}
      <Dialog open={showNewActivityDialog} onOpenChange={setShowNewActivityDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('activities.new')}</DialogTitle>
            <DialogDescription>{t('activities.newDescription')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>{t('activities.fields.type')}</Label>
              <Select value={newActivity.type} onValueChange={(value) => setNewActivity((p) => ({ ...p, type: value as any }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="note">{t('activities.types.note')}</SelectItem>
                  <SelectItem value="call">{t('activities.types.call')}</SelectItem>
                  <SelectItem value="email">{t('activities.types.email')}</SelectItem>
                  <SelectItem value="meeting">{t('activities.types.meeting')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('activities.fields.title')}</Label>
              <Input
                placeholder={t('activities.fields.titlePlaceholder')}
                value={newActivity.title}
                onChange={(e) => setNewActivity((p) => ({ ...p, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('activities.fields.description')}</Label>
              <Textarea
                placeholder={t('activities.fields.descriptionPlaceholder')}
                value={newActivity.description}
                onChange={(e) => setNewActivity((p) => ({ ...p, description: e.target.value }))}
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowNewActivityDialog(false);
                setNewActivity({ type: 'note', title: '', description: '' });
              }}
            >
              {t('actions.cancel')}
            </Button>

            <Button
              onClick={() => {
                const now = new Date();
                const createdAt = new Intl.DateTimeFormat(locale, {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                }).format(now);

                setActivities((prev) => [
                  {
                    id: String(Date.now()),

                    type: newActivity.type,
                    title: newActivity.title || t('activities.defaults.title'),
                    description: newActivity.description || t('activities.defaults.description'),
                    createdBy: t('activities.defaults.createdBy'),
                    createdAt,
                  },
                  ...prev,
                ]);

                toast.success(t('toasts.activityRegistered'));
                setShowNewActivityDialog(false);
                setNewActivity({ type: 'note', title: '', description: '' });
              }}
            >
              {t('activities.actions.save')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
