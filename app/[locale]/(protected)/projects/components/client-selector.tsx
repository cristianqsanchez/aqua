'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronsUpDown, Building2, User, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { getCustomersForClientSelector } from '../actions';
import { cx } from 'class-variance-authority';

type CustomerOption = {
  id: string;
  display_name: string;
  customer_type: 'individual' | 'company' | null;
  status: 'prospect' | 'active' | 'inactive' | 'vip' | null;
  email: string | null;
  phone: string | null;
  mobile: string | null;
};

interface ClientSelectorProps {
  value?: string;
  onValueChange: (value: string, clientName: string) => void;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  required?: boolean;
}

function getStatusLabel(t: ReturnType<typeof useTranslations>, status: CustomerOption['status']) {
  if (!status) return t('clientSelector.status.unknown');

  const map: Record<NonNullable<CustomerOption['status']>, string> = {
    prospect: t('clientSelector.status.prospect'),
    active: t('clientSelector.status.active'),
    vip: t('clientSelector.status.vip'),
    inactive: t('clientSelector.status.inactive'),
  };


  return map[status];
}


function getStatusBadgeClass(status: CustomerOption['status']) {
  // semantic tokens only

  switch (status) {
    case 'vip':
      return 'bg-warning/10 text-foreground border-border';
    case 'active':

      return 'bg-success/10 text-foreground border-border';
    case 'prospect':
      return 'bg-secondary text-secondary-foreground border-border';
    case 'inactive':
      return 'bg-muted text-muted-foreground border-border';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
}

export function ClientSelector({
  value,
  onValueChange,
  placeholder,
  error = false,
  disabled = false,
  required = false,
}: ClientSelectorProps) {
  const t = useTranslations('projects');

  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<CustomerOption[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const data = await getCustomersForClientSelector();
        if (!cancelled) setItems(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);


  const selectedClient = useMemo(() => items.find((c) => c.id === value), [items, value]);

  const filteredClients = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    if (!q) return items;

    return items.filter((c) => {
      const phone = (c.phone || '').toLowerCase();
      const mobile = (c.mobile || '').toLowerCase();
      const email = (c.email || '').toLowerCase();
      const name = (c.display_name || '').toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q) || mobile.includes(q);
    });
  }, [items, searchQuery]);

  const handleSelect = (clientId: string) => {
    const client = items.find((c) => c.id === clientId);
    if (!client) return;


    onValueChange(clientId, client.display_name);
    setOpen(false);
    setSearchQuery('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-required={required}
          disabled={disabled}
          className={cx(
            'w-full justify-between font-normal',
            !selectedClient && 'text-muted-foreground',
            error && 'border-destructive focus-visible:ring-destructive'
          )}
        >
          {selectedClient ? (
            <div className="flex min-w-0 flex-1 items-center gap-2">
              {selectedClient.customer_type === 'company' ? (
                <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
              ) : (
                <User className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}

              <span className="truncate text-foreground">{selectedClient.display_name}</span>


              <Badge
                variant="outline"
                className={cx('ml-auto shrink-0 text-xs', getStatusBadgeClass(selectedClient.status))}
              >
                {getStatusLabel(t, selectedClient.status)}
              </Badge>
            </div>
          ) : (
            <span>{placeholder ?? t('clientSelector.placeholder')}</span>
          )}

          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>

      </PopoverTrigger>

      <PopoverContent className="w-130 p-0" align="start">
        <Command shouldFilter={false}>
          <div className="flex items-center border-b border-border px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              placeholder={t('clientSelector.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={loading}
            />
          </div>

          <CommandList>
            <CommandEmpty>
              <div className="py-6 text-center text-sm">
                <p className="text-muted-foreground">{t('clientSelector.empty.title')}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t('clientSelector.empty.subtitle')}</p>
              </div>
            </CommandEmpty>


            <CommandGroup>
              {filteredClients.map((client) => {
                const isSelected = value === client.id;
                const phone = client.mobile || client.phone;

                return (
                  <CommandItem
                    key={client.id}
                    value={client.id}
                    onSelect={() => handleSelect(client.id)}
                    className="flex cursor-pointer items-center gap-3 py-3"
                  >
                    <Check className={cx('h-4 w-4 shrink-0', isSelected ? 'opacity-100' : 'opacity-0')} />

                    <div className="flex shrink-0 items-center gap-2">

                      {client.customer_type === 'company' ? (
                        <Building2 className="h-4 w-4 text-primary" />
                      ) : (
                        <User className="h-4 w-4 text-primary" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">

                        <p className="truncate text-sm font-medium text-foreground">{client.display_name}</p>
                        <Badge
                          variant="outline"
                          className={cx('shrink-0 text-xs', getStatusBadgeClass(client.status))}
                        >
                          {getStatusLabel(t, client.status)}
                        </Badge>
                      </div>

                      <div className="mt-1 flex items-center gap-3">
                        <p className="truncate text-xs text-muted-foreground">{client.email ?? t('clientSelector.noEmail')}</p>
                        {phone ? (
                          <>
                            <span className="text-muted-foreground/50">•</span>
                            <p className="text-xs text-muted-foreground">{phone}</p>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
