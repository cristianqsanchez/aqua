'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { getBranchesForSelect } from '../actions';

type BranchOption = { id: string; name: string };

export function BranchSelector(props: {
  value: string;
  onValueChange: (id: string) => void;
  placeholder?: string;
  error?: boolean;
  required?: boolean;
}) {
  const t = useTranslations('projects');

  const [items, setItems] = useState<BranchOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const data = await getBranchesForSelect();
        if (!cancelled) setItems(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (

    <Select value={props.value} onValueChange={props.onValueChange}>
      <SelectTrigger className={props.error ? 'border-destructive' : ''} aria-required={props.required}>

        <SelectValue placeholder={loading ? t('loading.branches') : props.placeholder} />
      </SelectTrigger>
      <SelectContent>
        {items.map((b) => (
          <SelectItem key={b.id} value={b.id}>
            {b.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
