import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

const namespaces = [
  'common',
  'nav',
  'userMenu',
  'profile',
  'settings',
  'auth',
  'logout',
  'dashboard',
  'tasks',
  'alerts',
  'sales',
  'accounts',
  'crmDashboard',
  'projects',
  'workOrders',
  'purchaseOrders',
  'goodsReceiptModule',
  'inventory',
  'finance',
  'invoicing',
  'payments',
  'financialCalendar',
  'overdueControl',
  'tickets',
  'warranties',
  'maintenance',
  'insights',
  'supplierAnalysis',
  'settingsModule',
  'pricing',
  'platformOverview',
  'currenciesModule',
  'tenantsModule',
  'marginProfitability',
  'quoteBuilder',
  'supplierCalendar',
  'projectCalendar',
  'validation',
  'errors',
  'success',
  'services',
  'orders',
  'suppliers',
  'businessLifecycle',
  'invoiceWizardDemo',
  'invoiceWizard',
  'invoiceForm',
];

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as typeof routing.locales[number])) {
    locale = routing.defaultLocale;
  }

  const messages = await Promise.all(
    namespaces.map(async (ns) => {
      try {
        const module = await import(`../messages/${locale}/${ns}.json`);
        return { [ns]: module.default };
      } catch {
        return { [ns]: {} };
      }
    })
  );

  return {
    locale,
    messages: Object.assign({}, ...messages),
  };
});
