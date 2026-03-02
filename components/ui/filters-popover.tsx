import { Filter } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './popover';
import { Label } from './label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';

interface FilterOption {
  id: string;
  label: string;
  options: { value: string; label: string }[];
}

interface FiltersPopoverProps {
  filters: FilterOption[];
  activeFilters: Record<string, string>;
  onFilterChange: (filterId: string, value: string) => void;
  onClearAll: () => void;
}

export function FiltersPopover({
  filters,
  activeFilters,
  onFilterChange,
  onClearAll,
}: FiltersPopoverProps) {
  const activeCount = Object.values(activeFilters).filter(v => v !== 'all').length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filtros
          {activeCount > 0 && (
            <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
              {activeCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Filtros</h4>
            {activeCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="h-auto p-0 text-xs text-slate-600 hover:text-slate-900"
              >
                Limpiar todos
              </Button>
            )}
          </div>

          {filters.map((filter) => (
            <div key={filter.id} className="space-y-2">
              <Label className="text-xs text-slate-600">{filter.label}</Label>
              <Select
                value={activeFilters[filter.id] || 'all'}
                onValueChange={(value) => onFilterChange(filter.id, value)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

