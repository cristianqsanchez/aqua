"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LineChart,
  Users,
  User2,
  Target,
  Briefcase,
  ShoppingCart,
  FolderKanban,
  ClipboardList,
  DollarSign,
  CreditCard,
  Landmark,
  CalendarDays,
  AlertCircle,
  TrendingUp,
  Percent,
  Headphones,
  Wrench,
  BarChart3,
  GitBranch,
  FileText,
  Settings,
  Shield,
  Database,
  Building2,
  Coins,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

export type SidebarItem = {
  label: string;
  href?: string;
  icon?: React.ElementType;
  children?: SidebarItem[];

};

export const sidebarRoutes: SidebarItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "CRM",
    icon: LineChart,
    children: [
      { label: "Dashboard CRM", href: "/crm", icon: BarChart3 },
      { label: "Leads", href: "/leads", icon: Users },
      { label: "Cuentas", href: "/accounts", icon: User2 },
      { label: "Oportunidades", href: "/opportunities", icon: Target },
    ],
  },
  {
    label: "Operaciones",
    icon: Briefcase,
    children: [
      { label: "Orders", href: "/orders", icon: ShoppingCart },
      { label: "Projects", href: "/projects", icon: FolderKanban },
      { label: "Work Orders", href: "/work-orders", icon: ClipboardList },
    ],

  },
  {
    label: "Finanzas",
    icon: DollarSign,
    children: [
      { label: "Invoicing", href: "/invoicing", icon: FileText },
      { label: "Payments", href: "/payments", icon: CreditCard },
      { label: "Finance", href: "/finance", icon: Landmark },
      { label: "Financial Calendar", href: "/financial-calendar", icon: CalendarDays },
      { label: "Overdue Control", href: "/overdue-control", icon: AlertCircle },
      { label: "Margin / Profitability", href: "/costs", icon: TrendingUp },

      { label: "Rates", href: "/rates", icon: Percent },
    ],
  },
  {
    label: "Postventa",
    icon: Headphones,
    children: [
      { label: "Post-sales Tickets", href: "/post-sales-tickets", icon: Headphones },
      { label: "Warranty Claims", href: "/warranty-claims", icon: Shield },
      { label: "Maintenance Planning", href: "/maintenance-planning", icon: Wrench },
    ],
  },
  {
    label: "Análisis",
    href: "/insights",
    icon: BarChart3,
  },
  {
    label: "Flujo de Negocio",
    href: "/workflow",
    icon: GitBranch,
  },
  {
    label: "Demo: Wizard Factura",
    href: "/demos/invoice-wizard",
    icon: FileText,
  },
  {
    label: "Configuración",
    href: "/settings",
    icon: Settings,
  },
];

export const adminRoutes: SidebarItem = {
  label: "ADMIN",
  icon: Shield,
  children: [
    { label: "Database Init", href: "/admin/database-init", icon: Database },

    { label: "Platform Overview", href: "/admin/platform", icon: LayoutDashboard },
    { label: "Empresas", href: "/admin/tenants", icon: Building2 },
    { label: "Monedas", href: "/admin/currencies", icon: Coins },
  ],
};

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}


function isActive(pathname: string, href?: string) {
  if (!href) return false;
  return pathname === href || pathname.startsWith(href + "/");
}

function hasActiveChild(item: SidebarItem, pathname: string): boolean {
  if (item.href && isActive(pathname, item.href)) return true;
  if (!item.children) return false;
  return item.children.some((child) => hasActiveChild(child, pathname));

}


function SidebarItemComponent({
  item,
  pathname,
  level = 0,
}: {

  item: SidebarItem;
  pathname: string;
  level?: number;
}) {
  const Icon = item.icon;
  const hasChildren = !!item.children?.length;
  const active = isActive(pathname, item.href);

  const childActive = hasActiveChild(item, pathname);


  const [open, setOpen] = React.useState(childActive);

  React.useEffect(() => {
    if (childActive) setOpen(true);
  }, [childActive]);

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setOpen((prev) => !prev)}
          className={cx(
            "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition",
            childActive
              ? "bg-slate-100 text-slate-900"
              : "text-slate-700 hover:bg-slate-100"
          )}
        >
          <div className="flex items-center gap-3">
            {Icon && <Icon size={18} />}
            <span>{item.label}</span>

          </div>


          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        {open && (
          <div className="mt-1 space-y-1">
            {item.children!.map((child) => (
              <SidebarItemComponent

                key={child.label}
                item={child}
                pathname={pathname}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }


  return (
    <Link
      href={item.href!}
      className={cx(
        "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition",
        level > 0 && "pl-10",
        active
          ? "bg-teal-100 text-teal-700 font-semibold"
          : "text-slate-700 hover:bg-slate-100"
      )}
    >
      {Icon && <Icon size={18} />}
      <span>{item.label}</span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[260px] border-r border-slate-200 bg-white h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto p-3 space-y-4">

        {sidebarRoutes.map((item) => (
          <SidebarItemComponent
            key={item.label}
            item={item}
            pathname={pathname}
          />
        ))}

        <div className="pt-4 border-t border-slate-200">
          <SidebarItemComponent
            item={adminRoutes}
            pathname={pathname}
          />
        </div>
      </div>
    </aside>
  );
}
