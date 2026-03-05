'use client'

import { useState, useTransition } from 'react'
import { ArrowLeft, Building2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  createAccount,
  updateAccount,
  type AccountDetails,
  type AccountFormValues,
} from '../actions'

type AccountFormProps = {
  locale: string
  mode: 'create' | 'edit'
  account?: AccountDetails | null
  onBack: () => void
}

const COUNTRY_CODES = ['ESP', 'FRA', 'PRT', 'USA', 'MEX'] as const

function mapAccountToFormValues(locale: string, account?: AccountDetails | null): AccountFormValues {
  if (!account) {
    return {
      locale,
      accountName: '',
      accountType: 'customer',
      relationshipStatus: 'active',
      industry: '',
      annualRevenue: '',
      employeeCount: '',
      website: '',
      phone: '',
      email: '',
      billingAddress: '',
      billingCity: '',
      billingState: '',
      billingPostalCode: '',
      billingCountryCode: 'ESP',
      shippingSameAsBilling: true,
      shippingAddress: '',
      shippingCity: '',
      shippingState: '',
      shippingPostalCode: '',
      shippingCountryCode: 'ESP',
      taxId: '',
      notes: '',
    }
  }

  const shippingSameAsBilling =
    (account.shipping_address ?? '') === (account.billing_address ?? '') &&
    (account.shipping_city ?? '') === (account.billing_city ?? '') &&
    (account.shipping_state ?? '') === (account.billing_state ?? '') &&
    (account.shipping_postal_code ?? '') === (account.billing_postal_code ?? '') &&
    (account.shipping_country_code ?? '') === (account.billing_country_code ?? '')

  return {
    locale,
    accountName: account.account_name,
    accountType: (account.account_type ?? 'customer') as AccountFormValues['accountType'],
    relationshipStatus: (account.relationship_status ?? 'active') as AccountFormValues['relationshipStatus'],
    industry: account.industry ?? '',
    annualRevenue: account.annual_revenue?.toString() ?? '',
    employeeCount: account.employee_count?.toString() ?? '',
    website: account.website ?? '',
    phone: account.phone ?? '',
    email: account.email ?? '',
    billingAddress: account.billing_address ?? '',
    billingCity: account.billing_city ?? '',
    billingState: account.billing_state ?? '',
    billingPostalCode: account.billing_postal_code ?? '',
    billingCountryCode: account.billing_country_code ?? 'ESP',
    shippingSameAsBilling,
    shippingAddress: account.shipping_address ?? '',
    shippingCity: account.shipping_city ?? '',
    shippingState: account.shipping_state ?? '',
    shippingPostalCode: account.shipping_postal_code ?? '',
    shippingCountryCode: account.shipping_country_code ?? 'ESP',
    taxId: account.tax_id ?? '',
    notes: account.notes ?? '',
  }
}

export function AccountForm({ locale, mode, account, onBack }: AccountFormProps) {
  const t = useTranslations('accounts.create')
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState<AccountFormValues>(() => mapAccountToFormValues(locale, account))

  const handleChange = <K extends keyof AccountFormValues>(field: K, value: AccountFormValues[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    startTransition(async () => {
      const result =
        mode === 'create'
          ? await createAccount(formData)
          : await updateAccount(account?.id ?? '', formData)

      if (!result.success) {
        toast.error(result.error || t(`toasts.${mode === 'create' ? 'createError' : 'updateError'}`))
        return
      }

      toast.success(t(`toasts.${mode === 'create' ? 'created' : 'updated'}`))
      onBack()
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t('actions.back')}
        </Button>
        <div>
          <h2 className="text-xl font-semibold text-foreground">{t('title')}</h2>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {t('sections.basic.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="accountName">{t('fields.accountName.label')}</Label>
              <Input
                id="accountName"
                required
                placeholder={t('fields.accountName.placeholder')}
                value={formData.accountName}
                onChange={(event) => handleChange('accountName', event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountType">{t('fields.accountType.label')}</Label>
              <Select value={formData.accountType} onValueChange={(value) => handleChange('accountType', value as AccountFormValues['accountType'])}>
                <SelectTrigger id="accountType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">{t('accountType.customer')}</SelectItem>
                  <SelectItem value="prospect">{t('accountType.prospect')}</SelectItem>
                  <SelectItem value="partner">{t('accountType.partner')}</SelectItem>
                  <SelectItem value="supplier">{t('accountType.supplier')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationshipStatus">{t('fields.relationshipStatus.label')}</Label>
              <Select
                value={formData.relationshipStatus}
                onValueChange={(value) => handleChange('relationshipStatus', value as AccountFormValues['relationshipStatus'])}
              >
                <SelectTrigger id="relationshipStatus">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t('relationshipStatus.active')}</SelectItem>
                  <SelectItem value="inactive">{t('relationshipStatus.inactive')}</SelectItem>
                  <SelectItem value="prospect">{t('relationshipStatus.prospect')}</SelectItem>
                  <SelectItem value="partner">{t('relationshipStatus.partner')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">{t('fields.industry.label')}</Label>
              <Input
                id="industry"
                placeholder={t('fields.industry.placeholder')}
                value={formData.industry}
                onChange={(event) => handleChange('industry', event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">{t('fields.website.label')}</Label>
              <Input
                id="website"
                type="url"
                placeholder={t('fields.website.placeholder')}
                value={formData.website}
                onChange={(event) => handleChange('website', event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="annualRevenue">{t('fields.annualRevenue.label')}</Label>
              <Input
                id="annualRevenue"
                type="number"
                placeholder={t('fields.annualRevenue.placeholder')}
                value={formData.annualRevenue}
                onChange={(event) => handleChange('annualRevenue', event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeeCount">{t('fields.employeeCount.label')}</Label>
              <Input
                id="employeeCount"
                type="number"
                placeholder={t('fields.employeeCount.placeholder')}
                value={formData.employeeCount}
                onChange={(event) => handleChange('employeeCount', event.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('sections.contact.title')}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">{t('fields.email.label')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('fields.email.placeholder')}
                value={formData.email}
                onChange={(event) => handleChange('email', event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t('fields.phone.label')}</Label>
              <Input
                id="phone"
                placeholder={t('fields.phone.placeholder')}
                value={formData.phone}
                onChange={(event) => handleChange('phone', event.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('sections.billing.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="billingAddress">{t('fields.billingAddress.label')}</Label>
              <Input
                id="billingAddress"
                placeholder={t('fields.billingAddress.placeholder')}
                value={formData.billingAddress}
                onChange={(event) => handleChange('billingAddress', event.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="billingCity">{t('fields.billingCity.label')}</Label>
                <Input
                  id="billingCity"
                  placeholder={t('fields.billingCity.placeholder')}
                  value={formData.billingCity}
                  onChange={(event) => handleChange('billingCity', event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingState">{t('fields.billingState.label')}</Label>
                <Input
                  id="billingState"
                  placeholder={t('fields.billingState.placeholder')}
                  value={formData.billingState}
                  onChange={(event) => handleChange('billingState', event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingPostalCode">{t('fields.billingPostalCode.label')}</Label>
                <Input
                  id="billingPostalCode"
                  placeholder={t('fields.billingPostalCode.placeholder')}
                  value={formData.billingPostalCode}
                  onChange={(event) => handleChange('billingPostalCode', event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingCountryCode">{t('fields.billingCountryCode.label')}</Label>
              <Select value={formData.billingCountryCode} onValueChange={(value) => handleChange('billingCountryCode', value)}>
                <SelectTrigger id="billingCountryCode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRY_CODES.map((countryCode) => (
                    <SelectItem key={countryCode} value={countryCode}>
                      {t(`countries.${countryCode}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('sections.shipping.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="shippingSameAsBilling"
                checked={formData.shippingSameAsBilling}
                onCheckedChange={(checked) => handleChange('shippingSameAsBilling', checked === true)}
              />
              <Label htmlFor="shippingSameAsBilling" className="cursor-pointer font-normal">
                {t('fields.shippingSameAsBilling.label')}
              </Label>
            </div>

            {!formData.shippingSameAsBilling && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="shippingAddress">{t('fields.shippingAddress.label')}</Label>
                  <Input
                    id="shippingAddress"
                    placeholder={t('fields.shippingAddress.placeholder')}
                    value={formData.shippingAddress}
                    onChange={(event) => handleChange('shippingAddress', event.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="shippingCity">{t('fields.shippingCity.label')}</Label>
                    <Input
                      id="shippingCity"
                      placeholder={t('fields.shippingCity.placeholder')}
                      value={formData.shippingCity}
                      onChange={(event) => handleChange('shippingCity', event.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shippingState">{t('fields.shippingState.label')}</Label>
                    <Input
                      id="shippingState"
                      placeholder={t('fields.shippingState.placeholder')}
                      value={formData.shippingState}
                      onChange={(event) => handleChange('shippingState', event.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shippingPostalCode">{t('fields.shippingPostalCode.label')}</Label>
                    <Input
                      id="shippingPostalCode"
                      placeholder={t('fields.shippingPostalCode.placeholder')}
                      value={formData.shippingPostalCode}
                      onChange={(event) => handleChange('shippingPostalCode', event.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shippingCountryCode">{t('fields.shippingCountryCode.label')}</Label>
                  <Select value={formData.shippingCountryCode} onValueChange={(value) => handleChange('shippingCountryCode', value)}>
                    <SelectTrigger id="shippingCountryCode">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRY_CODES.map((countryCode) => (
                        <SelectItem key={countryCode} value={countryCode}>
                          {t(`countries.${countryCode}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('sections.additional.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="taxId">{t('fields.taxId.label')}</Label>
              <Input
                id="taxId"
                placeholder={t('fields.taxId.placeholder')}
                value={formData.taxId}
                onChange={(event) => handleChange('taxId', event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t('fields.notes.label')}</Label>
              <Textarea
                id="notes"
                rows={4}
                placeholder={t('fields.notes.placeholder')}
                value={formData.notes}
                onChange={(event) => handleChange('notes', event.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onBack} disabled={isPending}>
            {t('actions.cancel')}
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? t(`actions.${mode === 'create' ? 'creating' : 'saving'}`) : t(`actions.${mode === 'create' ? 'create' : 'save'}`)}
          </Button>
        </div>
      </form>
    </div>
  )
}
