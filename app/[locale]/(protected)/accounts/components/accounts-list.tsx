'use client'

import { useMemo, useState, useTransition } from 'react'
import {
  Briefcase,
  Building2,
  Edit,
  Mail,
  MoreVertical,
  Phone,
  Plus,
  Search,
  Target,
  Trash2,
  TrendingUp,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { FiltersPopover } from '@/components/ui/filters-popover'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { deleteAccount, type AccountListItem } from '../actions'

interface AccountsListProps {
  locale: string
  initialAccounts: AccountListItem[]
  onCreateAccount: () => void
  onEditAccount: (id: string) => void
}

export function AccountsList({
  locale,
  initialAccounts,
  onCreateAccount,
  onEditAccount,
}: AccountsListProps) {
  const t = useTranslations('accounts.list')
  const [isPending, startTransition] = useTransition()
  const [accounts, setAccounts] = useState<AccountListItem[]>(initialAccounts)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<Record<string, string>>({
    accountType: 'all',
    relationshipStatus: 'all',
  })

  const filterOptions = useMemo(
    () => [
      {
        id: 'accountType',
        label: t('filters.accountType.label'),
        options: [
          { value: 'customer', label: t('accountType.customer') },
          { value: 'prospect', label: t('accountType.prospect') },
          { value: 'partner', label: t('accountType.partner') },
          { value: 'supplier', label: t('accountType.supplier') },
        ],
      },
      {
        id: 'relationshipStatus',
        label: t('filters.relationshipStatus.label'),
        options: [
          { value: 'active', label: t('relationshipStatus.active') },
          { value: 'inactive', label: t('relationshipStatus.inactive') },
          { value: 'prospect', label: t('relationshipStatus.prospect') },
          { value: 'partner', label: t('relationshipStatus.partner') },
        ],
      },
    ],
    [t],
  )

  const handleDelete = async () => {
    if (!accountToDelete) return

    startTransition(async () => {
      const result = await deleteAccount(accountToDelete, locale)

      if (!result.success) {
        toast.error(result.error || t('toasts.deleteError'))
        return
      }

      setAccounts((prev) => prev.filter((account) => account.id !== accountToDelete))
      setDeleteDialogOpen(false)
      setAccountToDelete(null)
      toast.success(t('toasts.deleted'))
    })
  }

  const openDeleteDialog = (id: string) => {
    setAccountToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleFilterChange = (filterId: string, value: string) => {
    setFilters((prev) => ({ ...prev, [filterId]: value }))
  }

  const handleClearFilters = () => {
    setFilters({ accountType: 'all', relationshipStatus: 'all' })
  }

  const filteredAccounts = useMemo(() => {
    let result = [...accounts]

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (account) =>
          account.account_name.toLowerCase().includes(query) ||
          account.account_number.toLowerCase().includes(query) ||
          account.email?.toLowerCase().includes(query) ||
          account.phone?.toLowerCase().includes(query) ||
          account.industry?.toLowerCase().includes(query),
      )
    }

    if (filters.accountType !== 'all') {
      result = result.filter((account) => account.account_type === filters.accountType)
    }

    if (filters.relationshipStatus !== 'all') {
      result = result.filter((account) => account.relationship_status === filters.relationshipStatus)
    }

    return result
  }, [accounts, filters, searchQuery])

  const getAccountTypeBadgeVariant = (
    type: string | null,
  ): 'default' | 'secondary' | 'success' | 'warning' => {
    switch (type) {
      case 'customer':
        return 'success'
      case 'prospect':
        return 'warning'
      case 'partner':
        return 'secondary'
      case 'supplier':
      default:
        return 'default'
    }
  }

  const getRelationshipStatusBadgeVariant = (
    status: string | null,
  ): 'default' | 'secondary' | 'success' | 'destructive' => {
    switch (status) {
      case 'active':
        return 'success'
      case 'inactive':
        return 'destructive'
      case 'prospect':
        return 'secondary'
      case 'partner':
      default:
        return 'default'
    }
  }

  const formatCurrency = (value?: number | null) => {
    if (!value) return t('values.empty')
    return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(value)
  }

  const isFiltering = Boolean(searchQuery.trim()) || Object.values(filters).some((value) => value !== 'all')
  const activeCustomers = accounts.filter((account) => account.account_type === 'customer' && account.relationship_status === 'active').length
  const prospects = accounts.filter((account) => account.account_type === 'prospect' || account.relationship_status === 'prospect').length
  const partners = accounts.filter((account) => account.account_type === 'partner' || account.relationship_status === 'partner').length

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('search.placeholder')}
            className="pl-9"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <FiltersPopover
            filters={filterOptions}
            activeFilters={filters}
            onFilterChange={handleFilterChange}
            onClearAll={handleClearFilters}
          />
          <Button onClick={onCreateAccount}>
            <Plus className="mr-2 h-4 w-4" />
            {t('actions.newAccount')}
          </Button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4 text-card-foreground">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-accent p-2">
              <Building2 className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('stats.total')}</p>
              <p className="text-2xl font-semibold text-foreground">{accounts.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 text-card-foreground">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-accent p-2">
              <Target className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('stats.activeCustomers')}</p>
              <p className="text-2xl font-semibold text-foreground">{activeCustomers}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 text-card-foreground">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-accent p-2">
              <TrendingUp className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('stats.prospects')}</p>
              <p className="text-2xl font-semibold text-foreground">{prospects}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 text-card-foreground">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-accent p-2">
              <Briefcase className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('stats.partners')}</p>
              <p className="text-2xl font-semibold text-foreground">{partners}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card text-card-foreground">
        {filteredAccounts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-foreground">
              {isFiltering ? t('empty.filteredTitle') : t('empty.title')}
            </h3>
            <p className="mb-6 text-muted-foreground">
              {isFiltering ? t('empty.filteredSubtitle') : t('empty.subtitle')}
            </p>
            {!isFiltering && (
              <Button onClick={onCreateAccount}>
                <Plus className="mr-2 h-4 w-4" />
                {t('actions.createFirst')}
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('table.number')}</TableHead>
                <TableHead>{t('table.name')}</TableHead>
                <TableHead>{t('table.type')}</TableHead>
                <TableHead>{t('table.status')}</TableHead>
                <TableHead>{t('table.industry')}</TableHead>
                <TableHead>{t('table.contact')}</TableHead>
                <TableHead>{t('table.location')}</TableHead>
                <TableHead>{t('table.annualRevenue')}</TableHead>
                <TableHead className="text-right">{t('table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map((account) => (
                <TableRow key={account.id} className="hover:bg-accent/60">
                  <TableCell>
                    <span className="font-mono text-sm text-muted-foreground">{account.account_number}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">{account.account_name}</p>
                        {account.website && <p className="text-xs text-muted-foreground">{account.website}</p>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getAccountTypeBadgeVariant(account.account_type)}>
                      {account.account_type
                        ? t(`accountType.${account.account_type}` as never)
                        : t('values.empty')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRelationshipStatusBadgeVariant(account.relationship_status)}>
                      {account.relationship_status
                        ? t(`relationshipStatus.${account.relationship_status}` as never)
                        : t('values.empty')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{account.industry || t('values.empty')}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {account.email && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span>{account.email}</span>
                        </div>
                      )}
                      {account.phone && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{account.phone}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {account.billing_city && account.billing_country_code
                        ? `${account.billing_city}, ${account.billing_country_code}`
                        : t('values.empty')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-foreground">{formatCurrency(account.annual_revenue)}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEditAccount(account.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          {t('actions.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDeleteDialog(account.id)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t('actions.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('delete.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('delete.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground"
            >
              {isPending ? t('actions.deleting') : t('actions.confirmDelete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
