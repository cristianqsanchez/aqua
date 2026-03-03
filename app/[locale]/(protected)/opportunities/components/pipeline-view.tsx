'use client';

import { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ArrowLeft, Plus, Edit, Eye, DollarSign, Calendar, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface Opportunity {
  id: string;
  opportunity_number: string;
  opportunity_name: string;
  stage: string;
  amount?: number;
  probability?: number;
  expected_close_date?: string;
  account?: {
    account_name: string;
  };
}

// Mock data inicial - mismo que en opportunities-list.tsx
const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: '1',
    opportunity_number: 'OPP-001',
    opportunity_name: 'Renovación Piscina Hotel Royal Madrid',
    stage: 'negotiation',
    amount: 185000,
    probability: 75,
    expected_close_date: '2024-04-15',
    account: {
      account_name: 'Hoteles Royal Group S.A.',
    }
  },
  {
    id: '2',
    opportunity_number: 'OPP-002',
    opportunity_name: 'Mantenimiento Piscinas Municipales 2024',
    stage: 'proposal',
    amount: 45000,
    probability: 60,
    expected_close_date: '2024-03-30',
    account: {
      account_name: 'Ayuntamiento de Marbella',
    }
  },
  {
    id: '3',
    opportunity_number: 'OPP-003',
    opportunity_name: 'Actualización Sistema Filtración Club Náutico',
    stage: 'closed_won',
    amount: 68000,
    probability: 100,
    expected_close_date: '2024-02-15',
    account: {
      account_name: 'Club Náutico Barcelona',
    }
  },
  {
    id: '4',
    opportunity_number: 'OPP-004',
    opportunity_name: 'Piscinas Urbanización Costa Bella',
    stage: 'qualification',
    amount: 320000,
    probability: 40,
    expected_close_date: '2024-07-01',
    account: {
      account_name: 'Inmobiliaria Costa del Sol',
    }
  },
  {
    id: '5',
    opportunity_number: 'OPP-005',
    opportunity_name: 'Alianza Construcciones Marítimas',
    stage: 'prospecting',
    amount: 150000,
    probability: 25,
    expected_close_date: '2024-06-30',
    account: {
      account_name: 'Construcciones Marítimas López',
    }
  },
];

interface PipelineViewProps {
  onViewOpportunity: (id: string) => void;
  onEditOpportunity: (id: string) => void;
  onBack: () => void;
}

const STAGES = [
  { id: 'prospecting', label: 'Prospección', color: 'bg-slate-100 border-slate-300' },
  { id: 'qualification', label: 'Cualificación', color: 'bg-blue-100 border-blue-300' },
  { id: 'proposal', label: 'Propuesta', color: 'bg-purple-100 border-purple-300' },
  { id: 'negotiation', label: 'Negociación', color: 'bg-orange-100 border-orange-300' },
  { id: 'closed_won', label: 'Ganado', color: 'bg-green-100 border-green-300' },
  { id: 'closed_lost', label: 'Perdido', color: 'bg-red-100 border-red-300' },
];

const ItemType = {
  OPPORTUNITY: 'opportunity',
};

interface OpportunityCardProps {
  opportunity: Opportunity;
  onView: () => void;
  onEdit: () => void;
}

function OpportunityCard({ opportunity, onView, onEdit }: OpportunityCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemType.OPPORTUNITY,
    item: { id: opportunity.id, stage: opportunity.stage },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div
      ref={drag}
      className={`bg-white rounded-lg border border-slate-200 p-3 mb-2 cursor-move hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-sm text-slate-900 flex-1 pr-2 line-clamp-2">
          {opportunity.opportunity_name}
        </h4>
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
            className="p-1 hover:bg-slate-100 rounded"
          >
            <Eye className="h-3 w-3 text-slate-500" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1 hover:bg-slate-100 rounded"
          >
            <Edit className="h-3 w-3 text-slate-500" />
          </button>
        </div>
      </div>
      
      {opportunity.account && (
        <p className="text-xs text-slate-600 mb-2 truncate">
          {opportunity.account.account_name}
        </p>
      )}
      
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <DollarSign className="h-3 w-3" />
          <span className="font-medium text-slate-900">
            {formatCurrency(opportunity.amount)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {opportunity.probability && (
            <div className="flex items-center gap-1">
              <Percent className="h-3 w-3" />
              <span>{opportunity.probability}%</span>
            </div>
          )}
          {opportunity.expected_close_date && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(opportunity.expected_close_date)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface PipelineColumnProps {
  stage: typeof STAGES[0];
  opportunities: Opportunity[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDrop: (opportunityId: string, newStage: string) => void;
}

function PipelineColumn({ stage, opportunities, onView, onEdit, onDrop }: PipelineColumnProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemType.OPPORTUNITY,
    drop: (item: { id: string; stage: string }) => {
      if (item.stage !== stage.id) {
        onDrop(item.id, stage.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const totalAmount = opportunities.reduce((sum, opp) => sum + (opp.amount || 0), 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="flex-shrink-0 w-80">
      <div className={`rounded-lg border-2 ${stage.color} p-3 mb-3`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm text-slate-900">{stage.label}</h3>
          <Badge variant="secondary" className="bg-white">
            {opportunities.length}
          </Badge>
        </div>
        <p className="text-xs text-slate-600 font-medium">
          {formatCurrency(totalAmount)}
        </p>
      </div>
      
      <div
        ref={drop}
        className={`min-h-[calc(100vh-300px)] rounded-lg border-2 border-dashed ${
          isOver ? 'border-cyan-400 bg-cyan-50' : 'border-slate-200 bg-slate-50'
        } p-3 transition-colors`}
      >
        {opportunities.map((opp) => (
          <OpportunityCard
            key={opp.id}
            opportunity={opp}
            onView={() => onView(opp.id)}
            onEdit={() => onEdit(opp.id)}
          />
        ))}
        {opportunities.length === 0 && (
          <div className="text-center py-8 text-sm text-slate-400">
            Arrastra oportunidades aquí
          </div>
        )}
      </div>
    </div>
  );
}

export function PipelineView({ onViewOpportunity, onEditOpportunity, onBack }: PipelineViewProps) {
  const t = useTranslations();
  const [opportunities, setOpportunities] = useState<Opportunity[]>(MOCK_OPPORTUNITIES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Datos mock ya cargados, no necesita hacer nada
    setLoading(false);
  }, []);

  const handleDrop = async (opportunityId: string, newStage: string) => {
    try {
      // Update local state
      setOpportunities((prev) =>
        prev.map((opp) =>
          opp.id === opportunityId ? { ...opp, stage: newStage } : opp
        )
      );

      toast.success('Etapa actualizada correctamente');
    } catch (error) {
      console.error('Error updating opportunity stage:', error);
      toast.error('Error al actualizar etapa');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  const totalOpportunities = opportunities.length;
  const totalAmount = opportunities.reduce((sum, opp) => sum + (opp.amount || 0), 0);
  const weightedAmount = opportunities.reduce((sum, opp) => {
    const amount = opp.amount || 0;
    const probability = (opp.probability || 0) / 100;
    return sum + (amount * probability);
  }, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Volver a Lista
              </Button>
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">Pipeline de Ventas</h1>
                <p className="text-sm text-slate-600">Gestiona tus oportunidades visualmente</p>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-600 mb-1">Total Oportunidades</p>
              <p className="text-2xl font-semibold text-slate-900">{totalOpportunities}</p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-600 mb-1">Valor Total Pipeline</p>
              <p className="text-2xl font-semibold text-slate-900">{formatCurrency(totalAmount)}</p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-600 mb-1">Valor Ponderado</p>
              <p className="text-2xl font-semibold text-cyan-600">{formatCurrency(weightedAmount)}</p>
            </div>
          </div>
        </div>

        {/* Pipeline Board */}
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {STAGES.map((stage) => (
              <PipelineColumn
                key={stage.id}
                stage={stage}
                opportunities={opportunities.filter((opp) => opp.stage === stage.id)}
                onView={onViewOpportunity}
                onEdit={onEditOpportunity}
                onDrop={handleDrop}
              />
            ))}
          </div>
        </div>

        {/* Helper Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            💡 Arrastra las tarjetas entre columnas para actualizar la etapa de cada oportunidad
          </p>
        </div>
      </div>
    </DndProvider>
  );
}
