'use client';
import { MarginSimulationPanel } from './margin-simulation-panel';
import { GenerateProjectFromQuote } from './generate-project-from-quote';
import { MaterialPlanning } from './material-planning';
import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { 
  ArrowLeft, 
  Save, 
  Send, 
  Copy, 
  CheckCircle2, 
  FileText,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Plus,
  Minus,
  Search,
  X,
  TrendingUp,
  TrendingDown,
  Info,
  Calculator,
  ClipboardList,
  Edit2,
  Trash2,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useTranslations } from 'next-intl';

interface QuoteBuilderProps {
  opportunityId?: string;
  quotationId?: string;
  onBack: () => void;
}

interface KitComponent {
  id: string;
  name: string;
  cost: number;
  price: number;
}

interface Kit {
  id: string;
  name: string;
  type: 'promo' | 'configured';
  price: number;
  cost: number;
  components: KitComponent[];
}

interface ConfigGroup {
  id: string;
  name: string;
  defaultComponent: KitComponent;
  selectedComponent: KitComponent;
  alternatives: KitComponent[];
  isSwapped: boolean;
}

interface AddonItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
}

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  provider: string;
  estimatedCost: number;
  status: 'pending' | 'confirmed' | 'contracted';
  plannedDate: string;
  required: boolean;
  notes?: string;
}

export function QuoteBuilder({ opportunityId, quotationId, onBack }: QuoteBuilderProps) {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [selectedKit, setSelectedKit] = useState<Kit | null>(null);
  const [availableRates, setAvailableRates] = useState<any[]>([]);
  const [loadingRates, setLoadingRates] = useState(true);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [version, setVersion] = useState('v1');
  const [status, setStatus] = useState<'draft' | 'sent' | 'approved' | 'rejected' | 'expired'>('draft');
  const [quotationNumber, setQuotationNumber] = useState('COT-2026-001');
  const [clientName, setClientName] = useState('Hotel Paradise Resort');
  const [opportunityName, setOpportunityName] = useState('Oportunidad: Hotel Paradise Resort');
  const [branchName, setBranchName] = useState('Madrid Central');
  const [showMarginSimulation, setShowMarginSimulation] = useState(false);
  const [showGenerateProject, setShowGenerateProject] = useState(false);
  const [showMaterialPlanning, setShowMaterialPlanning] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    baseKit: true,
    stairs: false,
    liner: false,
    pump: false,
    borders: false,
    accessories: false,
  });

  // Services state
  const [services, setServices] = useState<ServiceItem[]>([
    {
      id: 's1',
      name: 'Excavación de Terreno',
      description: 'Preparación del sitio',
      provider: 'Excavaciones Pro',
      estimatedCost: 3500,
      status: 'pending',
      plannedDate: '2026-03-15',
      required: true,
    },
    {
      id: 's2',
      name: 'Transporte de Materiales',
      description: 'Entrega a obra',
      provider: 'Transportes Rápidos',
      estimatedCost: 850,
      status: 'confirmed',
      plannedDate: '2026-03-18',
      required: true,
    },
    {
      id: 's3',
      name: 'Instalación Hidráulica',
      description: 'Sistema de filtración',
      provider: 'Hidráulica Aqua Plus',
      estimatedCost: 2200,
      status: 'contracted',
      plannedDate: '2026-03-22',
      required: true,
    },
  ]);
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [serviceFormData, setServiceFormData] = useState<Partial<ServiceItem>>({
    name: '',
    description: '',
    provider: '',
    estimatedCost: 0,
    status: 'pending',
    plannedDate: '',
    required: true,
    notes: '',
  });

  // Load quotation data if editing
  useEffect(() => {
    if (quotationId) {
      loadQuotation();
    }
  }, [quotationId]);

  // Load available rates from API
  useEffect(() => {
    loadRates();
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoadingSuppliers(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c765fa07/suppliers`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch suppliers');

      const { data } = await response.json();
      
      // If no suppliers exist, initialize mock data
      if (!data || data.length === 0) {
        await initializeMockSuppliers();
      } else {
        setSuppliers(data || []);
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
      // Try to initialize mock data on error
      await initializeMockSuppliers();
    } finally {
      setLoadingSuppliers(false);
    }
  };

  const initializeMockSuppliers = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c765fa07/suppliers/init-mock`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const { data } = await response.json();
        setSuppliers(data || []);
      }
    } catch (error) {
      console.error('Error initializing mock suppliers:', error);
      setSuppliers([]);
    }
  };

  const loadRates = async () => {
    try {
      setLoadingRates(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c765fa07/rates`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch rates');

      const { data } = await response.json();
      setAvailableRates(data || []);
      
      // Convert first rate to kit format for initial selection
      if (data && data.length > 0) {
        const firstRate = data[0];
        const kit = convertRateToKit(firstRate);
        setSelectedKit(kit);
        
        // Set services from the rate's installation items
        const servicesFromRate = convertRateToServices(firstRate);
        setServices(servicesFromRate);
      } else {
        toast.error(t.quoteBuilder.noRatesConfigured, {
          description: t.quoteBuilder.noRatesDescription
        });
      }
    } catch (error) {
      console.error('Error loading rates:', error);
      toast.error(t.quoteBuilder.errorLoadingRates);
    } finally {
      setLoadingRates(false);
    }
  };

  const convertRateToKit = (rate: any): Kit => {
    // Calculate total supply (Fourniture) cost
    const supplyCost = rate.kitPrice + rate.transport + rate.assistance;
    
    // For the price, we'll add a 40% markup as standard
    const supplyPrice = Math.round(supplyCost * 1.40);
    
    return {
      id: rate.id,
      name: rate.name,
      type: 'configured',
      price: supplyPrice,
      cost: supplyCost,
      components: [
        { id: 'kit', name: 'Kit de Piscina', cost: rate.kitPrice, price: Math.round(rate.kitPrice * 1.40) },
        { id: 'transport', name: 'Transporte', cost: rate.transport, price: Math.round(rate.transport * 1.40) },
        { id: 'assistance', name: 'Asistencia Técnica', cost: rate.assistance, price: Math.round(rate.assistance * 1.40) },
      ],
    };
  };

  const convertRateToServices = (rate: any): ServiceItem[] => {
    const services: ServiceItem[] = [];
    
    // Map installation items to services
    const installationItems = [
      { key: 'earthwork', name: 'Excavación de Terreno', cost: rate.earthwork },
      { key: 'earthworkFilling', name: 'Relleno de Terreno', cost: rate.earthworkFilling },
      { key: 'doubleFond', name: 'Doble Fondo', cost: rate.doubleFond },
      { key: 'earthEvacuation', name: 'Evacuación de Tierra', cost: rate.earthEvacuation },
      { key: 'discharge', name: 'Descarga', cost: rate.discharge },
      { key: 'poolMasonry', name: 'Albañilería de Piscina', cost: rate.poolMasonry },
      { key: 'assemblyPouring', name: 'Montaje y Vertido', cost: rate.assemblyPouring },
      { key: 'filtrationInstall', name: 'Instalación de Filtración', cost: rate.filtrationInstall },
      { key: 'doubleFondInstall', name: 'Instalación Doble Fondo', cost: rate.doubleFondInstall },
      { key: 'stairInstall', name: 'Instalación de Escalera', cost: rate.stairInstall },
      { key: 'supportPlots', name: 'Plots de Soporte', cost: rate.supportPlots },
      { key: 'concrete', name: 'Hormigón', cost: rate.concrete },
      { key: 'pump', name: 'Bomba', cost: rate.pump },
      { key: 'linerInstall', name: 'Instalación de Liner', cost: rate.linerInstall },
      { key: 'electricalConnections', name: 'Conexiones Eléctricas', cost: rate.electricalConnections },
    ];

    installationItems.forEach((item, index) => {
      if (item.cost > 0) {
        services.push({
          id: `s${index + 1}`,
          name: item.name,
          description: `Servicio de ${item.name.toLowerCase()}`,
          provider: '', // Empty - to be selected from suppliers list
          estimatedCost: item.cost,
          status: 'pending',
          plannedDate: '',
          required: true,
        });
      }
    });

    return services;
  };

  const loadQuotation = async () => {
    if (!quotationId) return;
    
    setLoading(true);
    try {
      // API call to load quotation
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock data - en producción esto vendría de la API
      setQuotationNumber('COT-2026-001');
      setVersion('v3');
      setStatus('sent');
      setClientName('Hotel Paradise Resort');
      setOpportunityName('Proyecto Piscina Hotel Paradise');
      
      // Set kit from available rates
      if (availableRates.length > 0) {
        const kit = convertRateToKit(availableRates[0]);
        setSelectedKit(kit);
      }
      
      // Set some swaps
      const updatedGroups = [...configGroups];
      updatedGroups[0].selectedComponent = updatedGroups[0].alternatives[1];
      updatedGroups[0].isSwapped = true;
      setConfigGroups(updatedGroups);
      
      // Set some addons
      setAddons([
        { id: 'a1', name: 'Calentador Solar', quantity: 1, unitPrice: 1800, unitCost: 1200 },
        { id: 'a5', name: 'Sistema de Cloración Salina', quantity: 1, unitPrice: 1400, unitCost: 950 },
      ]);
      
      setDiscount(5);
      setDepositPercentage(30);
      
      toast.success('Cotización cargada correctamente');
    } catch (error) {
      console.error('Error loading quotation:', error);
      toast.error('Error al cargar la cotización');
    } finally {
      setLoading(false);
    }
  };

  // Configuration groups
  const [configGroups, setConfigGroups] = useState<ConfigGroup[]>([
    {
      id: 'stairs',
      name: 'Escaleras',
      defaultComponent: { id: 's1', name: 'Escalera Angular', cost: 450, price: 650 },
      selectedComponent: { id: 's1', name: 'Escalera Angular', cost: 450, price: 650 },
      alternatives: [
        { id: 's1', name: 'Escalera Angular', cost: 450, price: 650 },
        { id: 's2', name: 'Escalera Frontal', cost: 550, price: 780 },
        { id: 's3', name: 'Escalera Romana', cost: 680, price: 950 },
      ],
      isSwapped: false,
    },
    {
      id: 'liner',
      name: 'Color de Liner',
      defaultComponent: { id: 'l1', name: 'Liner Azul Estándar', cost: 800, price: 1100 },
      selectedComponent: { id: 'l1', name: 'Liner Azul Estándar', cost: 800, price: 1100 },
      alternatives: [
        { id: 'l1', name: 'Liner Azul Estándar', cost: 800, price: 1100 },
        { id: 'l2', name: 'Liner Arena', cost: 900, price: 1250 },
        { id: 'l3', name: 'Liner Gris Perla', cost: 950, price: 1350 },
      ],
      isSwapped: false,
    },
    {
      id: 'pump',
      name: 'Tipo de Bomba',
      defaultComponent: { id: 'p1', name: 'Bomba Estándar 0.5 HP', cost: 320, price: 480 },
      selectedComponent: { id: 'p1', name: 'Bomba Estándar 0.5 HP', cost: 320, price: 480 },
      alternatives: [
        { id: 'p1', name: 'Bomba Estándar 0.5 HP', cost: 320, price: 480 },
        { id: 'p2', name: 'Bomba Variable 0.75 HP', cost: 480, price: 680 },
        { id: 'p3', name: 'Bomba Premium 1.0 HP', cost: 620, price: 880 },
      ],
      isSwapped: false,
    },
  ]);

  // Add-ons
  const [addons, setAddons] = useState<AddonItem[]>([]);
  const [searchAddon, setSearchAddon] = useState('');

  // Available products for add-ons
  const availableAddons = [
    { id: 'a1', name: 'Calentador Solar', unitCost: 1200, unitPrice: 1800 },
    { id: 'a2', name: 'Sistema de Iluminación LED', unitCost: 450, unitPrice: 650 },
    { id: 'a3', name: 'Cubierta Automática', unitCost: 2500, unitPrice: 3800 },
    { id: 'a4', name: 'Robot Limpiador', unitCost: 800, unitPrice: 1200 },
    { id: 'a5', name: 'Sistema de Cloración Salina', unitCost: 950, unitPrice: 1400 },
  ];

  // Discount and payment
  const [discount, setDiscount] = useState(0);
  const [depositPercentage, setDepositPercentage] = useState(30);

  // Available kits - Now loaded from rates API
  // const availableKits: Kit[] = [
  //   ... (replaced by availableRates from API)
  // ];

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleKitSelection = (kitId: string) => {
    const rate = availableRates.find(r => r.id === kitId);
    if (rate) {
      const kit = convertRateToKit(rate);
      setSelectedKit(kit);
      
      // Update services from the selected rate
      const servicesFromRate = convertRateToServices(rate);
      setServices(servicesFromRate);
      
      // Reset swaps when changing kit
      setConfigGroups(prev => prev.map(group => ({
        ...group,
        selectedComponent: group.defaultComponent,
        isSwapped: false,
      })));
    }
  };

  const handleSwapComponent = (groupId: string, newComponent: KitComponent) => {
    setConfigGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          selectedComponent: newComponent,
          isSwapped: newComponent.id !== group.defaultComponent.id,
        };
      }
      return group;
    }));
  };

  const handleAddAddon = (productId: string) => {
    const product = availableAddons.find(p => p.id === productId);
    if (!product) return;

    const existingAddon = addons.find(a => a.id === productId);
    if (existingAddon) {
      setAddons(prev => prev.map(a => 
        a.id === productId ? { ...a, quantity: a.quantity + 1 } : a
      ));
    } else {
      setAddons(prev => [...prev, {
        id: productId,
        name: product.name,
        quantity: 1,
        unitPrice: product.unitPrice,
        unitCost: product.unitCost,
      }]);
    }
    toast.success(`${product.name} agregado`);
  };

  const handleRemoveAddon = (addonId: string) => {
    setAddons(prev => prev.filter(a => a.id !== addonId));
  };

  const handleUpdateAddonQuantity = (addonId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveAddon(addonId);
    } else {
      setAddons(prev => prev.map(a => 
        a.id === addonId ? { ...a, quantity } : a
      ));
    }
  };

  // Financial calculations
  const calculateFinancials = () => {
    if (!selectedKit) {
      return {
        subtotal: 0,
        totalCost: 0,
        totalPrice: 0,
        margin: 0,
        marginPercent: 0,
        discount: 0,
        taxes: 0,
        total: 0,
        deposit: 0,
      };
    }

    // Base kit
    let totalCost = selectedKit.cost;
    let totalPrice = selectedKit.price;

    // Swaps impact
    configGroups.forEach(group => {
      if (group.isSwapped) {
        // Remove default component cost/price
        totalCost = totalCost - group.defaultComponent.cost + group.selectedComponent.cost;
        totalPrice = totalPrice - group.defaultComponent.price + group.selectedComponent.price;
      }
    });

    // Add-ons
    addons.forEach(addon => {
      totalCost += addon.unitCost * addon.quantity;
      totalPrice += addon.unitPrice * addon.quantity;
    });

    const subtotal = totalPrice;
    const discountAmount = (subtotal * discount) / 100;
    const afterDiscount = subtotal - discountAmount;
    const taxes = afterDiscount * 0.16; // 16% IVA
    const total = afterDiscount + taxes;
    const margin = afterDiscount - totalCost;
    const marginPercent = afterDiscount > 0 ? (margin / afterDiscount) * 100 : 0;
    const deposit = (total * depositPercentage) / 100;

    return {
      subtotal,
      totalCost,
      totalPrice,
      margin,
      marginPercent,
      discount: discountAmount,
      taxes,
      total,
      deposit,
    };
  };

  const financials = calculateFinancials();

  const getStatusConfig = (s: string) => {
    const configs: Record<string, { label: string; className: string }> = {
      draft: { label: 'Borrador', className: 'bg-slate-100 text-slate-700' },
      sent: { label: 'Enviada', className: 'bg-blue-100 text-blue-700' },
      approved: { label: 'Aprobada', className: 'bg-emerald-100 text-emerald-700' },
      rejected: { label: 'Rechazada', className: 'bg-red-100 text-red-700' },
      expired: { label: 'Expirada', className: 'bg-amber-100 text-amber-700' },
    };
    return configs[s] || configs.draft;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    try {
      // API call to save draft
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success(t.quoteBuilder.quotationSaved);
    } catch (error) {
      toast.error(t.quoteBuilder.errorSaving);
    } finally {
      setLoading(false);
    }
  };

  const handleSendToClient = async () => {
    if (!selectedKit) {
      toast.error(t.quoteBuilder.selectBaseKit);
      return;
    }
    
    setLoading(true);
    try {
      // API call to send quote
      await new Promise(resolve => setTimeout(resolve, 800));
      setStatus('sent');
      toast.success(t.quoteBuilder.quotationSent);
    } catch (error) {
      toast.error(t.quoteBuilder.errorSending);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setStatus('approved');
      toast.success(t.quoteBuilder.quotationApproved);
      // Open generate project dialog after approval
      setTimeout(() => {
        setShowGenerateProject(true);
      }, 500);
    } catch (error) {
      toast.error(t.quoteBuilder.errorApproving);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    try {
      setLoading(true);
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPos = 20;
      
      // Colors
      const primaryColor: [number, number, number] = [0, 150, 136]; // Teal
      const secondaryColor: [number, number, number] = [100, 100, 100];
      const lightGray: [number, number, number] = [245, 245, 245];
      
      // Header - Company Name
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('AQUA ERP', 20, 25);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(t.quoteBuilder.pdfQuotation, pageWidth - 20, 25, { align: 'right' });
      doc.text(`#${quotationNumber}`, pageWidth - 20, 32, { align: 'right' });
      
      yPos = 50;
      
      // Quotation Info
      doc.setTextColor(...secondaryColor);
      doc.setFontSize(10);
      doc.text(`${t.quoteBuilder.pdfDate}: ${new Date().toLocaleDateString()}`, 20, yPos);
      doc.text(`${t.quoteBuilder.pdfValidUntil}: ${new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}`, 20, yPos + 6);
      yPos += 20;
      
      // Client Information
      doc.setFillColor(...lightGray);
      doc.rect(0, yPos, pageWidth, 8, 'F');
      doc.setTextColor(...primaryColor);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(t.quoteBuilder.pdfClientInfo, 20, yPos + 5);
      yPos += 14;
      
      doc.setTextColor(...secondaryColor);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`${t.quoteBuilder.client}: ${clientName}`, 20, yPos);
      doc.text(`${t.quoteBuilder.branch}: ${branchName}`, 20, yPos + 6);
      yPos += 20;
      
      // Base Kit Section
      if (selectedKit) {
        doc.setFillColor(...lightGray);
        doc.rect(0, yPos, pageWidth, 8, 'F');
        doc.setTextColor(...primaryColor);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(t.quoteBuilder.pdfBaseKitSection, 20, yPos + 5);
        yPos += 14;
        
        const kitData = [[
          selectedKit.name,
          selectedKit.type === 'promo' ? 'Promoción' : 'Configurado',
          formatCurrency(selectedKit.price)
        ]];
        
        autoTable(doc, {
          startY: yPos,
          head: [[t.quoteBuilder.pdfDescription, 'Tipo', t.quoteBuilder.pdfPrice]],
          body: kitData,
          theme: 'grid',
          headStyles: { fillColor: primaryColor, fontSize: 9 },
          bodyStyles: { fontSize: 9 },
          margin: { left: 20, right: 20 },
        });
        
        yPos = (doc as any).lastAutoTable.finalY + 10;
      }
      
      // Configuration Options
      const swappedGroups = configGroups.filter(group => group.isSwapped);
      if (swappedGroups.length > 0) {
        doc.setFillColor(...lightGray);
        doc.rect(0, yPos, pageWidth, 8, 'F');
        doc.setTextColor(...primaryColor);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(t.quoteBuilder.pdfConfigurationOptions, 20, yPos + 5);
        yPos += 14;
        
        const swapData = swappedGroups.map(group => [
          group.defaultComponent.name,
          group.selectedComponent.name,
          formatCurrency(group.selectedComponent.price - group.defaultComponent.price)
        ]);
        
        autoTable(doc, {
          startY: yPos,
          head: [[t.quoteBuilder.pdfComponent, t.quoteBuilder.pdfAlternative, t.quoteBuilder.pdfPriceAdjustment]],
          body: swapData,
          theme: 'grid',
          headStyles: { fillColor: primaryColor, fontSize: 9 },
          bodyStyles: { fontSize: 9 },
          margin: { left: 20, right: 20 },
        });
        
        yPos = (doc as any).lastAutoTable.finalY + 10;
      }
      
      // Add-ons
      if (addons.length > 0) {
        if (yPos > pageHeight - 60) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFillColor(...lightGray);
        doc.rect(0, yPos, pageWidth, 8, 'F');
        doc.setTextColor(...primaryColor);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(t.quoteBuilder.pdfAddonsSection, 20, yPos + 5);
        yPos += 14;
        
        const addonData = addons.map(addon => [
          addon.name,
          addon.quantity.toString(),
          formatCurrency(addon.unitPrice),
          formatCurrency(addon.quantity * addon.unitPrice)
        ]);
        
        autoTable(doc, {
          startY: yPos,
          head: [[t.quoteBuilder.pdfDescription, t.quoteBuilder.pdfQty, t.quoteBuilder.pdfUnitPrice, t.quoteBuilder.subtotal]],
          body: addonData,
          theme: 'grid',
          headStyles: { fillColor: primaryColor, fontSize: 9 },
          bodyStyles: { fontSize: 9 },
          margin: { left: 20, right: 20 },
        });
        
        yPos = (doc as any).lastAutoTable.finalY + 10;
      }
      
      // Services
      if (services.length > 0) {
        if (yPos > pageHeight - 60) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFillColor(...lightGray);
        doc.rect(0, yPos, pageWidth, 8, 'F');
        doc.setTextColor(...primaryColor);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(t.quoteBuilder.pdfServicesSection, 20, yPos + 5);
        yPos += 14;
        
        const serviceData = services.map(service => [
          service.name,
          service.provider || t.quoteBuilder.noProvider,
          service.status === 'pending' ? t.quoteBuilder.statusPending : 
          service.status === 'confirmed' ? t.quoteBuilder.statusConfirmed : 
          t.quoteBuilder.statusContracted,
          formatCurrency(service.estimatedCost)
        ]);
        
        autoTable(doc, {
          startY: yPos,
          head: [[t.quoteBuilder.pdfService, t.quoteBuilder.pdfProvider, t.quoteBuilder.pdfStatus, t.quoteBuilder.pdfCost]],
          body: serviceData,
          theme: 'grid',
          headStyles: { fillColor: primaryColor, fontSize: 9 },
          bodyStyles: { fontSize: 9 },
          margin: { left: 20, right: 20 },
        });
        
        yPos = (doc as any).lastAutoTable.finalY + 10;
      }
      
      // Summary
      if (yPos > pageHeight - 80) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFillColor(...lightGray);
      doc.rect(0, yPos, pageWidth, 8, 'F');
      doc.setTextColor(...primaryColor);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(t.quoteBuilder.pdfQuotationSummary, 20, yPos + 5);
      yPos += 14;
      
      const summaryData = [
        [t.quoteBuilder.pdfKitComponents, formatCurrency(financials.baseKitTotal)],
        [t.quoteBuilder.pdfAddons, formatCurrency(financials.addonsTotal)],
        [t.quoteBuilder.pdfServices, formatCurrency(financials.servicesTotal)],
        [t.quoteBuilder.subtotalBeforeDiscount, formatCurrency(financials.subtotalBeforeDiscount)],
      ];
      
      if (discount > 0) {
        summaryData.push([`${t.quoteBuilder.pdfDiscount} (${discount}%)`, `-${formatCurrency(financials.discountAmount)}`]);
      }
      
      autoTable(doc, {
        startY: yPos,
        body: summaryData,
        theme: 'plain',
        bodyStyles: { fontSize: 10 },
        margin: { left: 20, right: 20 },
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 5;
      
      // Total
      doc.setFillColor(...primaryColor);
      doc.rect(20, yPos, pageWidth - 40, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(t.quoteBuilder.pdfTotal, 25, yPos + 7);
      doc.text(formatCurrency(financials.totalQuotation), pageWidth - 25, yPos + 7, { align: 'right' });
      yPos += 16;
      
      // Deposit
      if (depositPercentage > 0) {
        doc.setTextColor(...secondaryColor);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`${t.quoteBuilder.pdfDepositRequired} (${depositPercentage}%): ${formatCurrency(financials.depositAmount)}`, 20, yPos);
        doc.text(`${t.quoteBuilder.pdfRemainingBalance}: ${formatCurrency(financials.remainingBalance)}`, 20, yPos + 6);
        yPos += 16;
      }
      
      // Terms and Conditions
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFillColor(...lightGray);
      doc.rect(0, yPos, pageWidth, 8, 'F');
      doc.setTextColor(...primaryColor);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(t.quoteBuilder.pdfTermsConditions, 20, yPos + 5);
      yPos += 14;
      
      doc.setTextColor(...secondaryColor);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const termsLines = doc.splitTextToSize(t.quoteBuilder.pdfTermsText, pageWidth - 40);
      doc.text(termsLines, 20, yPos);
      
      // Footer
      doc.setTextColor(...primaryColor);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text(t.quoteBuilder.pdfFooter, pageWidth / 2, pageHeight - 20, { align: 'center' });
      
      // Save PDF
      doc.save(`Cotizacion_${quotationNumber}_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast.success(t.quoteBuilder.pdfGenerated);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error(t.quoteBuilder.errorGeneratingPdf);
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = getStatusConfig(status);
  const isLocked = status === 'approved';
  const isMarginLow = financials.marginPercent < 25;

  const filteredAddons = availableAddons.filter(addon =>
    addon.name.toLowerCase().includes(searchAddon.toLowerCase())
  );

  // Service dialog handlers
  const handleOpenServiceDialog = (service: ServiceItem) => {
    setEditingService(service);
    setServiceFormData(service);
    setShowServiceDialog(true);
  };

  const handleAddService = () => {
    setEditingService(null);
    setServiceFormData({
      name: '',
      description: '',
      provider: '',
      estimatedCost: 0,
      status: 'pending',
      plannedDate: '',
      required: true,
      notes: '',
    });
    setShowServiceDialog(true);
  };

  const handleSaveService = () => {
    if (!serviceFormData.name || !serviceFormData.provider || !serviceFormData.estimatedCost || !serviceFormData.plannedDate) {
      toast.error('Por favor complete todos los campos obligatorios');
      return;
    }

    const newService: ServiceItem = {
      id: editingService ? editingService.id : `s${Date.now()}`,
      name: serviceFormData.name,
      description: serviceFormData.description || '',
      provider: serviceFormData.provider,
      estimatedCost: serviceFormData.estimatedCost,
      status: serviceFormData.status as 'pending' | 'confirmed' | 'contracted',
      plannedDate: serviceFormData.plannedDate,
      required: serviceFormData.required ?? true,
      notes: serviceFormData.notes,
    };

    if (editingService) {
      setServices(prev => prev.map(s => (s.id === editingService.id ? newService : s)));
      toast.success('Servicio actualizado exitosamente');
    } else {
      setServices(prev => [...prev, newService]);
      toast.success('Servicio agregado exitosamente');
    }

    setShowServiceDialog(false);
  };

  const handleDeleteService = (serviceId: string) => {
    setServices(prev => prev.filter(s => s.id !== serviceId));
    toast.success('Servicio eliminado');
  };

  // If Material Planning is active, render it instead
  if (showMaterialPlanning) {
    return (
      <MaterialPlanning
        quoteId={quotationId || 'quote-1'}
        projectReference={quotationNumber}
        branchName={branchName}
        onBack={() => setShowMaterialPlanning(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1800px] mx-auto px-8 py-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
            <button onClick={onBack} className="hover:text-slate-900 transition-colors">
              Oportunidades
            </button>
            <ChevronRight className="w-4 h-4" />
            <button onClick={onBack} className="hover:text-slate-900 transition-colors">
              {opportunityName}
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900 font-medium">Cotización {version}</span>
          </div>

          {/* Title row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-slate-900">Configurador de Cotización</h1>
              <Badge className={`${statusConfig.className} px-3 py-1`}>
                {statusConfig.label}
              </Badge>
              
              {/* Version selector */}
              <Select value={version} onValueChange={setVersion} disabled={isLocked}>
                <SelectTrigger className="w-[100px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="v1">v1</SelectItem>
                  <SelectItem value="v2">v2</SelectItem>
                  <SelectItem value="v3">v3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button onClick={handleSaveDraft} variant="outline" size="sm" className="gap-2" disabled={loading || isLocked}>
                <Save className="w-4 h-4" />
                {loading ? t.quoteBuilder.saving : t.quoteBuilder.save}
              </Button>
              <Button onClick={handleSendToClient} variant="outline" size="sm" className="gap-2" disabled={loading || isLocked}>
                <Send className="w-4 h-4" />
                Enviar a Cliente
              </Button>
              <Button variant="outline" size="sm" className="gap-2" disabled={loading}>
                <Copy className="w-4 h-4" />
                Duplicar
              </Button>
              {status === 'sent' && (
                <Button onClick={handleApprove} size="sm" className="gap-2" disabled={loading}>
                  <CheckCircle2 className="w-4 h-4" />
                  {loading ? t.quoteBuilder.approving : t.quoteBuilder.approve}
                </Button>
              )}
              {/* Demo button to test project generation panel */}
              {status === 'approved' && (
                <>
                  <Button 
                    onClick={() => setShowMaterialPlanning(true)} 
                    size="sm" 
                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                    disabled={loading}
                  >
                    <Package className="w-4 h-4" />
                    {t.quoteBuilder.planMaterials}
                  </Button>
                  <Button 
                    onClick={() => setShowGenerateProject(true)} 
                    size="sm" 
                    className="gap-2 bg-teal-600 hover:bg-teal-700"
                    disabled={loading}
                  >
                    <ClipboardList className="w-4 h-4" />
                    {t.quoteBuilder.generateProject}
                  </Button>
                </>
              )}
              <Button 
                onClick={handleGeneratePDF} 
                variant="outline" 
                size="sm" 
                className="gap-2" 
                disabled={loading || !selectedKit}
              >
                <FileText className="w-4 h-4" />
                {loading ? t.quoteBuilder.generatingPdf : t.quoteBuilder.downloadPdf}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="max-w-[1800px] mx-auto px-8 py-6">
        {isLocked && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-sm text-emerald-800">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-medium">Cotización aprobada - Modo solo lectura</span>
          </div>
        )}

        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Configuration Panel */}
          <div className="col-span-3 space-y-4">
            {/* Base Kit Selection */}
            <Card>
              <CardHeader 
                className="cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => toggleGroup('baseKit')}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{t.quoteBuilder.baseKit}</CardTitle>
                  {expandedGroups.baseKit ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </CardHeader>
              {expandedGroups.baseKit && (
                <CardContent className="space-y-3">
                  <Select 
                    value={selectedKit?.id || ''} 
                    onValueChange={handleKitSelection}
                    disabled={isLocked || loadingRates}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingRates ? t.quoteBuilder.loadingRates : t.quoteBuilder.selectKit} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRates.map(rate => (
                        <SelectItem key={rate.id} value={rate.id}>
                          {rate.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedKit && (
                    <div className="space-y-2 p-3 bg-slate-50 rounded-lg text-xs">
                      <div className="flex items-center justify-between font-medium">
                        <span>{t.quoteBuilder.basePrice}</span>
                        <span>{formatCurrency(selectedKit.price)}</span>
                      </div>
                      {selectedKit.type === 'configured' && (
                        <div className="flex items-start gap-2 text-amber-700 mt-2">
                          <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span>{t.quoteBuilder.configuredKit}</span>
                        </div>
                      )}
                      <div className="pt-2 border-t border-slate-200">
                        <div className="text-slate-600 mb-1">{t.quoteBuilder.includedComponents}</div>
                        {selectedKit.components.map(comp => (
                          <div key={comp.id} className="text-slate-700 text-[11px] ml-2">
                            • {comp.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>

            {/* Configuration Groups */}
            {selectedKit && selectedKit.type !== 'configured' && configGroups.map(group => (
              <Card key={group.id}>
                <CardHeader 
                  className="cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => toggleGroup(group.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-sm">{group.name}</CardTitle>
                      {group.isSwapped && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-blue-50 text-blue-700 border-blue-200">
                          Modificado
                        </Badge>
                      )}
                    </div>
                    {expandedGroups[group.id] ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </CardHeader>
                {expandedGroups[group.id] && (
                  <CardContent className="space-y-2">
                    {group.isSwapped && (
                      <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs space-y-1">
                        <div className="text-slate-600">Reemplazando:</div>
                        <div className="text-slate-700 line-through">{group.defaultComponent.name}</div>
                        <div className="text-blue-700 font-medium">Con: {group.selectedComponent.name}</div>
                        <div className="flex items-center gap-1 text-blue-700 font-medium pt-1">
                          {group.selectedComponent.price - group.defaultComponent.price >= 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {group.selectedComponent.price - group.defaultComponent.price >= 0 ? '+' : ''}
                          {formatCurrency(group.selectedComponent.price - group.defaultComponent.price)}
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-1.5">
                      {group.alternatives.map(alt => (
                        <button
                          key={alt.id}
                          onClick={() => !isLocked && handleSwapComponent(group.id, alt)}
                          disabled={isLocked}
                          className={`w-full text-left p-2 rounded border transition-colors text-xs ${
                            group.selectedComponent.id === alt.id
                              ? 'bg-teal-50 border-teal-300 text-teal-900'
                              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                          } ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <div className="font-medium">{alt.name}</div>
                          <div className="text-[11px] text-slate-600">{formatCurrency(alt.price)}</div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}

            {/* Add-ons */}
            {selectedKit && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Agregar Opcionales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Buscar producto..."
                      value={searchAddon}
                      onChange={(e) => setSearchAddon(e.target.value)}
                      className="pl-8 h-9 text-sm"
                      disabled={isLocked}
                    />
                  </div>
                  <div className="space-y-1 max-h-[300px] overflow-y-auto">
                    {filteredAddons.map(addon => (
                      <div
                        key={addon.id}
                        className="flex items-center justify-between p-2 hover:bg-slate-50 rounded border border-transparent hover:border-slate-200 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-slate-900 truncate">{addon.name}</div>
                          <div className="text-[11px] text-slate-600">{formatCurrency(addon.unitPrice)}</div>
                        </div>
                        <Button
                          onClick={() => handleAddAddon(addon.id)}
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          disabled={isLocked}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Center Column - Quote Line Items */}
          <div className="col-span-6 space-y-4">
            {!selectedKit ? (
              <Card className="p-12 text-center">
                <div className="text-slate-400 mb-3">
                  <FileText className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">Selecciona un Kit Base</h3>
                <p className="text-sm text-slate-600">Comienza seleccionando un kit base en el panel izquierdo</p>
              </Card>
            ) : (
              <>
                {/* Base Kit Section */}
                <Card>
                  <CardHeader className="bg-slate-50">
                    <CardTitle className="text-sm font-semibold text-slate-900">1. Kit Base</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="p-4 border-b border-slate-100">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-slate-900">{selectedKit.name}</div>
                          <div className="text-xs text-slate-600 mt-0.5">Incluye componentes estándar</div>
                        </div>
                        <div className="text-right space-y-0.5">
                          <div className="font-semibold text-slate-900">{formatCurrency(selectedKit.price)}</div>
                          <div className="text-xs text-slate-600">
                            Costo: {formatCurrency(selectedKit.cost)} • 
                            Margen: {(((selectedKit.price - selectedKit.cost) / selectedKit.price) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Swaps Section */}
                {configGroups.some(g => g.isSwapped) && (
                  <Card>
                    <CardHeader className="bg-blue-50">
                      <CardTitle className="text-sm font-semibold text-slate-900">2. Modificaciones</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      {configGroups.filter(g => g.isSwapped).map(group => (
                        <div key={group.id} className="p-4 border-b border-slate-100 last:border-0">
                          <div className="space-y-2">
                            {/* Removed item */}
                            <div className="flex items-center justify-between text-sm opacity-60">
                              <div className="flex items-center gap-2">
                                <Minus className="w-3 h-3 text-red-600" />
                                <span className="line-through text-slate-600">{group.defaultComponent.name}</span>
                              </div>
                              <span className="text-slate-600 line-through">
                                -{formatCurrency(group.defaultComponent.price)}
                              </span>
                            </div>
                            
                            {/* Added item */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Plus className="w-3 h-3 text-emerald-600" />
                                <div>
                                  <div className="font-medium text-slate-900">{group.selectedComponent.name}</div>
                                  <div className="text-xs text-slate-600">
                                    Costo: {formatCurrency(group.selectedComponent.cost)} • 
                                    Margen: {(((group.selectedComponent.price - group.selectedComponent.cost) / group.selectedComponent.price) * 100).toFixed(1)}%
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-slate-900">
                                  {formatCurrency(group.selectedComponent.price)}
                                </div>
                                <div className={`text-xs font-medium ${
                                  group.selectedComponent.price - group.defaultComponent.price >= 0 
                                    ? 'text-emerald-700' 
                                    : 'text-red-700'
                                }`}>
                                  {group.selectedComponent.price - group.defaultComponent.price >= 0 ? '+' : ''}
                                  {formatCurrency(group.selectedComponent.price - group.defaultComponent.price)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Add-ons Section */}
                {addons.length > 0 && (
                  <Card>
                    <CardHeader className="bg-slate-50">
                      <CardTitle className="text-sm font-semibold text-slate-900">3. Opcionales Adicionales</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      {addons.map(addon => (
                        <div key={addon.id} className="p-4 border-b border-slate-100 last:border-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="flex items-center gap-1">
                                <Button
                                  onClick={() => handleUpdateAddonQuantity(addon.id, addon.quantity - 1)}
                                  size="sm"
                                  variant="outline"
                                  className="h-6 w-6 p-0"
                                  disabled={isLocked}
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="text-sm font-medium w-8 text-center">{addon.quantity}</span>
                                <Button
                                  onClick={() => handleUpdateAddonQuantity(addon.id, addon.quantity + 1)}
                                  size="sm"
                                  variant="outline"
                                  className="h-6 w-6 p-0"
                                  disabled={isLocked}
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-slate-900">{addon.name}</div>
                                <div className="text-xs text-slate-600">
                                  {formatCurrency(addon.unitPrice)} x {addon.quantity} • 
                                  Costo unitario: {formatCurrency(addon.unitCost)} • 
                                  Margen: {(((addon.unitPrice - addon.unitCost) / addon.unitPrice) * 100).toFixed(1)}%
                                </div>
                              </div>
                            </div>
                            <div className="text-right flex items-center gap-3">
                              <div>
                                <div className="font-semibold text-slate-900">
                                  {formatCurrency(addon.unitPrice * addon.quantity)}
                                </div>
                                <div className="text-xs text-slate-600">
                                  Margen: {formatCurrency((addon.unitPrice - addon.unitCost) * addon.quantity)}
                                </div>
                              </div>
                              {!isLocked && (
                                <Button
                                  onClick={() => handleRemoveAddon(addon.id)}
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Services Section */}
                <Card>
                  <CardHeader className="bg-slate-50 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-slate-900">4. Servicios</CardTitle>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-7 text-xs"
                      disabled={isLocked}
                      onClick={handleAddService}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Agregar
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="text-left py-2 px-4 font-medium text-slate-700 text-xs">Servicio</th>
                            <th className="text-left py-2 px-4 font-medium text-slate-700 text-xs">Proveedor</th>
                            <th className="text-right py-2 px-4 font-medium text-slate-700 text-xs">Costo</th>
                            <th className="text-center py-2 px-4 font-medium text-slate-700 text-xs">Estado</th>
                            <th className="text-center py-2 px-4 font-medium text-slate-700 text-xs w-10"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {services.map((service) => {
                            const getServiceStatusBadge = (status: 'pending' | 'confirmed' | 'contracted') => {
                              const statusConfig = {
                                pending: { label: 'Pendiente', className: 'bg-amber-50 text-amber-700 border-amber-200' },
                                confirmed: { label: 'Confirmado', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                                contracted: { label: 'Contratado', className: 'bg-blue-50 text-blue-700 border-blue-200' },
                              };
                              return statusConfig[status];
                            };
                            
                            const statusBadge = getServiceStatusBadge(service.status);
                            
                            return (
                              <tr key={service.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                                <td className="py-2.5 px-4">
                                  <div>
                                    <div className="font-medium text-slate-900 text-xs">{service.name}</div>
                                    <div className="text-[10px] text-slate-500">{service.description}</div>
                                  </div>
                                </td>
                                <td className="py-2.5 px-4 text-xs text-slate-600">
                                  {service.provider}
                                </td>
                                <td className="py-2.5 px-4 text-right">
                                  <span className="font-semibold text-xs">{formatCurrency(service.estimatedCost)}</span>
                                </td>
                                <td className="py-2.5 px-4 text-center">
                                  <Badge variant="outline" className={`${statusBadge.className} text-[10px] px-1.5 py-0`}>
                                    {statusBadge.label}
                                  </Badge>
                                </td>
                                <td className="py-2.5 px-4 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-6 w-6 p-0"
                                      disabled={isLocked}
                                      onClick={() => handleOpenServiceDialog(service)}
                                    >
                                      <Edit2 className="w-3 h-3 text-slate-400" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      disabled={isLocked}
                                      onClick={() => handleDeleteService(service.id)}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Summary Footer */}
                    <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                          <span className="text-slate-600">{services.filter(s => s.status === 'confirmed' || s.status === 'contracted').length} Confirmados</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                          <span className="text-slate-600">{services.filter(s => s.status === 'pending').length} Pendiente{services.filter(s => s.status === 'pending').length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wide">Total Servicios</div>
                        <div className="text-sm font-bold text-slate-900">
                          {formatCurrency(services.reduce((sum, s) => sum + s.estimatedCost, 0))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Right Column - Financial Summary */}
          <div className="col-span-3">
            <div className="sticky top-6 space-y-4">
              <Card className="border-2 border-slate-200">
                <CardHeader className="bg-slate-50">
                  <CardTitle className="text-base">Resumen Financiero</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Subtotal</span>
                      <span className="font-medium">{formatCurrency(financials.subtotal)}</span>
                    </div>

                    {/* Discount */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600">Descuento</span>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={discount}
                          onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                          className="w-16 h-6 text-xs"
                          disabled={isLocked}
                        />
                        <span className="text-xs text-slate-500">%</span>
                      </div>
                      <span className="font-medium text-red-600">-{formatCurrency(financials.discount)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">IVA (16%)</span>
                      <span className="font-medium">{formatCurrency(financials.taxes)}</span>
                    </div>

                    <div className="pt-3 border-t-2 border-slate-200">
                      <div className="flex items-center justify-between text-lg">
                        <span className="font-semibold text-slate-900">Total Contratado</span>
                        <span className="font-bold text-slate-900">{formatCurrency(financials.total)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Costo Estimado</span>
                      <span className="font-medium text-slate-700">{formatCurrency(financials.totalCost)}</span>
                    </div>

                    <div className={`p-3 rounded-lg ${
                      isMarginLow ? 'bg-amber-50 border border-amber-200' : 'bg-emerald-50 border border-emerald-200'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-medium ${isMarginLow ? 'text-amber-900' : 'text-emerald-900'}`}>
                          Margen Estimado
                        </span>
                        <span className={`font-bold text-lg ${isMarginLow ? 'text-amber-900' : 'text-emerald-900'}`}>
                          {financials.marginPercent.toFixed(1)}%
                        </span>
                      </div>
                      <div className={`text-xs ${isMarginLow ? 'text-amber-700' : 'text-emerald-700'}`}>
                        {formatCurrency(financials.margin)}
                      </div>
                      {isMarginLow && (
                        <div className="flex items-start gap-1 mt-2 text-xs text-amber-800">
                          <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span>Margen por debajo del umbral recomendado (25%)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Terms */}
                  <div className="pt-4 border-t border-slate-200 space-y-3">
                    <div className="text-sm font-medium text-slate-900">Condiciones de Pago</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600">Anticipo</span>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={depositPercentage}
                            onChange={(e) => setDepositPercentage(parseFloat(e.target.value) || 0)}
                            className="w-16 h-6 text-xs"
                            disabled={isLocked}
                          />
                          <span className="text-xs text-slate-500">%</span>
                        </div>
                        <span className="font-semibold text-teal-700">{formatCurrency(financials.deposit)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>Saldo pendiente</span>
                        <span>{formatCurrency(financials.total - financials.deposit)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              {!isLocked && (
                <div className="space-y-2">
                  <Button 
                    onClick={() => setShowMarginSimulation(true)} 
                    variant="outline" 
                    className="w-full gap-2 border-teal-300 text-teal-700 hover:bg-teal-50"
                    disabled={!selectedKit}
                  >
                    <Calculator className="w-4 h-4" />
                    {t.quoteBuilder.simulateMargin}
                  </Button>
                  <Button onClick={handleSendToClient} className="w-full gap-2" disabled={loading || !selectedKit}>
                    <Send className="w-4 h-4" />
                    {loading ? t.quoteBuilder.sending : t.quoteBuilder.sendToClient}
                  </Button>
                  <Button onClick={handleSaveDraft} variant="outline" className="w-full gap-2" disabled={loading}>
                    <Save className="w-4 h-4" />
                    {loading ? t.quoteBuilder.saving : t.quoteBuilder.save}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Margin Simulation Panel */}
      <MarginSimulationPanel
        isOpen={showMarginSimulation}
        onClose={() => setShowMarginSimulation(false)}
        quotationData={{
          version,
          status,
          totalContracted: financials.total,
          estimatedCost: financials.totalCost,
          currentDiscount: discount,
          isConfiguredKit: selectedKit?.type === 'configured' || false,
          hasSwaps: configGroups.some(g => g.isSwapped),
          swapCount: configGroups.filter(g => g.isSwapped).length,
          kitStrategy: selectedKit?.type === 'configured' ? 'configured' : 'promo-with-swaps',
        }}
        onApprove={handleApprove}
        onRequestApproval={() => {
          toast.info('Solicitud de aprobación enviada al gerente');
        }}
      />

      {/* Generate Project Panel */}
      <GenerateProjectFromQuote
        isOpen={showGenerateProject}
        onClose={() => setShowGenerateProject(false)}
        quoteData={{
          id: quotationId || 'quote-1',
          number: quotationNumber,
          version,
          clientName,
          poolType: selectedKit?.name.includes('8x4') ? 'Piscina 8x4' : 'Piscina 6x4',
          kitName: selectedKit?.name || '',
          hasSwaps: configGroups.some(g => g.isSwapped),
          swapCount: configGroups.filter(g => g.isSwapped).length,
          addons: addons.map(a => ({ name: a.name, quantity: a.quantity })),
        }}
        onGenerate={(projectData) => {
          console.log('Creating project:', projectData);
          // Here would navigate to projects module
        }}
      />

      {/* Service Dialog */}
      <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
        <DialogContent className="max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingService ? t.quoteBuilder.editService : t.quoteBuilder.addService}</DialogTitle>
            <DialogDescription>
              {editingService ? 'Actualiza los detalles del servicio.' : 'Añade un nuevo servicio a la cotización.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name">{t.quoteBuilder.serviceName}</Label>
              <Input
                id="name"
                value={serviceFormData.name || ''}
                onChange={(e) => setServiceFormData({ ...serviceFormData, name: e.target.value })}
                className="h-9"
                disabled={isLocked}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="description">{t.quoteBuilder.serviceDescription}</Label>
              <Textarea
                id="description"
                value={serviceFormData.description || ''}
                onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })}
                className="h-20"
                disabled={isLocked}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="provider">{t.quoteBuilder.provider}</Label>
              <Select
                value={serviceFormData.provider || 'unassigned'}
                onValueChange={(value) => setServiceFormData({ ...serviceFormData, provider: value === 'unassigned' ? '' : value })}
                disabled={isLocked || loadingSuppliers}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={loadingSuppliers ? t.quoteBuilder.loadingSuppliers : t.quoteBuilder.selectProvider} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">{t.quoteBuilder.noProvider}</SelectItem>
                  {suppliers.map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.name}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="estimatedCost">{t.quoteBuilder.estimatedCost}</Label>
              <Input
                id="estimatedCost"
                type="number"
                value={serviceFormData.estimatedCost || 0}
                onChange={(e) => setServiceFormData({ ...serviceFormData, estimatedCost: parseFloat(e.target.value) || 0 })}
                className="h-9"
                disabled={isLocked}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="status">{t.quoteBuilder.serviceStatus}</Label>
              <Select
                value={serviceFormData.status || 'pending'}
                onValueChange={(value) => setServiceFormData({ ...serviceFormData, status: value as 'pending' | 'confirmed' | 'contracted' })}
                disabled={isLocked}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">{t.quoteBuilder.statusPending}</SelectItem>
                  <SelectItem value="confirmed">{t.quoteBuilder.statusConfirmed}</SelectItem>
                  <SelectItem value="contracted">{t.quoteBuilder.statusContracted}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="plannedDate">{t.quoteBuilder.plannedDate}</Label>
              <Input
                id="plannedDate"
                type="date"
                value={serviceFormData.plannedDate || ''}
                onChange={(e) => setServiceFormData({ ...serviceFormData, plannedDate: e.target.value })}
                className="h-9"
                disabled={isLocked}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="required">Requerido</Label>
              <Select
                value={serviceFormData.required ? 'true' : 'false'}
                onValueChange={(value) => setServiceFormData({ ...serviceFormData, required: value === 'true' })}
                disabled={isLocked}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Sí</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={serviceFormData.notes || ''}
                onChange={(e) => setServiceFormData({ ...serviceFormData, notes: e.target.value })}
                className="h-20"
                disabled={isLocked}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setShowServiceDialog(false)}
              disabled={loading}
            >
              <X className="w-4 h-4" />
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              className="gap-2"
              onClick={handleSaveService}
              disabled={loading}
            >
              <Save className="w-4 h-4" />
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
