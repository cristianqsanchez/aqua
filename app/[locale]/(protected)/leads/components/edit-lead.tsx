'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Building2, User } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getLead, updateLead } from '../actions'

interface EditLeadProps {
  leadId: string;
  onBack: () => void;
  onSuccess: () => void;
}

export function EditLead({ leadId, onBack, onSuccess }: EditLeadProps) {
  const t = useTranslations('leads.edit')
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [formData, setFormData] = useState({
    customerType: 'company' as 'individual' | 'company',
    status: 'new',
    source: '',
    priority: 'medium',

    companyName: '',
    industry: '',
    website: '',

    firstName: '',
    lastName: '',

    contactName: '',
    email: '',
    phone: '',
    mobile: '',

    address: '',
    city: '',

    state: '',
    postalCode: '',
    countryCode: 'ESP',

    interest: '',
    estimatedValue: '',
    estimatedCloseDate: '',

    notes: '',
  })


  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        setLoadingData(true)
        const lead = await getLead(leadId)

        if (!lead) {
          toast.error(t('toasts.notFound'))
          onBack()
          return
        }

        if (!active) return

        setFormData({
          customerType: (lead.customer_type as 'company' | 'individual') || 'company',
          status: lead.status || 'new',
          source: lead.source || '',
          priority: lead.priority || 'medium',

          companyName: lead.company_name || '',
          industry: lead.industry || '',
          website: lead.website || '',

          firstName: lead.first_name || '',
          lastName: lead.last_name || '',

          contactName: lead.contact_name || '',
          email: lead.email || '',
          phone: lead.phone || '',
          mobile: lead.mobile || '',

          address: lead.address || '',
          city: lead.city || '',
          state: lead.state || '',
          postalCode: lead.postal_code || '',
          countryCode: lead.country_code || 'ESP',

          interest: lead.interest || '',
          estimatedValue: lead.estimated_value != null ? String(lead.estimated_value) : '',
          estimatedCloseDate: lead.estimated_close_date || '',

          notes: lead.notes || '',
        })
      } catch (error) {
        console.error('Error loading lead:', error)
        toast.error(t('toasts.loadError'))
      } finally {
        if (active) setLoadingData(false)
      }
    }

    load()

    return () => {
      active = false
    }
  }, [leadId, onBack, t])

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)

      const form = new FormData()
      form.append('customer_type', formData.customerType)
      form.append('status', formData.status)
      form.append('source', formData.source)
      form.append('priority', formData.priority)
      form.append('company_name', formData.customerType === 'company' ? formData.companyName : '')
      form.append('industry', formData.customerType === 'company' ? formData.industry : '')
      form.append('website', formData.customerType === 'company' ? formData.website : '')
      form.append('first_name', formData.customerType === 'individual' ? formData.firstName : '')
      form.append('last_name', formData.customerType === 'individual' ? formData.lastName : '')
      form.append('contact_name', formData.contactName)
      form.append('email', formData.email)
      form.append('phone', formData.phone)
      form.append('mobile', formData.mobile)
      form.append('address', formData.address)
      form.append('city', formData.city)
      form.append('state', formData.state)
      form.append('postal_code', formData.postalCode)
      form.append('country_code', formData.countryCode)
      form.append('interest', formData.interest)
      form.append('estimated_value', formData.estimatedValue)
      form.append('estimated_close_date', formData.estimatedCloseDate)
      form.append('notes', formData.notes)

      await updateLead(leadId, form)
      toast.success(t('toasts.updated'))
      onSuccess()
    } catch (error) {
      console.error('Error updating lead:', error)
      toast.error(t('toasts.updateError'))
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
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
            <CardTitle>{t('sections.customerType.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={formData.customerType}
              onValueChange={(value) => handleChange('customerType', value)}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem value="company" id="company" className="peer sr-only" />
                <Label
                  htmlFor="company"

                  className="flex flex-col items-center justify-between rounded-md border-2 border-border bg-card p-4 hover:bg-accent peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <Building2 className="mb-3 h-6 w-6 text-foreground" />
                  <span className="font-medium text-foreground">{t('sections.customerType.company')}</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="individual" id="individual" className="peer sr-only" />
                <Label
                  htmlFor="individual"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-border bg-card p-4 hover:bg-accent peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >

                  <User className="mb-3 h-6 w-6 text-foreground" />
                  <span className="font-medium text-foreground">{t('sections.customerType.individual')}</span>
                </Label>
              </div>

            </RadioGroup>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {formData.customerType === 'company'
                ? t('sections.identity.companyTitle')
                : t('sections.identity.individualTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.customerType === 'company' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">

                  <Label htmlFor="companyName">{t('fields.companyName.label')}</Label>

                  <Input
                    id="companyName"
                    placeholder={t('fields.companyName.placeholder')}
                    required
                    value={formData.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    disabled={loading}
                    className="bg-input-background border-border focus-visible:ring-ring"
                    autoComplete="organization"

                  />

                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">{t('fields.industry.label')}</Label>
                  <Input
                    id="industry"
                    placeholder={t('fields.industry.placeholder')}
                    value={formData.industry}
                    onChange={(e) => handleChange('industry', e.target.value)}
                    disabled={loading}
                    className="bg-input-background border-border focus-visible:ring-ring"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="website">{t('fields.website.label')}</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder={t('fields.website.placeholder')}
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    disabled={loading}
                    className="bg-input-background border-border focus-visible:ring-ring"
                    autoComplete="url"
                  />
                </div>
              </div>

            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t('fields.firstName.label')}</Label>
                  <Input
                    id="firstName"
                    placeholder={t('fields.firstName.placeholder')}
                    required
                    value={formData.firstName}

                    onChange={(e) => handleChange('firstName', e.target.value)}
                    disabled={loading}
                    className="bg-input-background border-border focus-visible:ring-ring"
                    autoComplete="given-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t('fields.lastName.label')}</Label>
                  <Input
                    id="lastName"
                    placeholder={t('fields.lastName.placeholder')}

                    required
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    disabled={loading}
                    className="bg-input-background border-border focus-visible:ring-ring"
                    autoComplete="family-name"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>

            <CardTitle>{t('sections.contact.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">{t('fields.contactName.label')}</Label>
                <Input
                  id="contactName"
                  placeholder={t('fields.contactName.placeholder')}
                  value={formData.contactName}
                  onChange={(e) => handleChange('contactName', e.target.value)}
                  disabled={loading}
                  className="bg-input-background border-border focus-visible:ring-ring"
                  autoComplete="name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('fields.email.label')}</Label>

                <Input
                  id="email"
                  type="email"
                  placeholder={t('fields.email.placeholder')}
                  required
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  disabled={loading}
                  className="bg-input-background border-border focus-visible:ring-ring"
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t('fields.phone.label')}</Label>
                <Input
                  id="phone"
                  placeholder={t('fields.phone.placeholder')}
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  disabled={loading}
                  className="bg-input-background border-border focus-visible:ring-ring"
                  autoComplete="tel"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile">{t('fields.mobile.label')}</Label>
                <Input
                  id="mobile"
                  placeholder={t('fields.mobile.placeholder')}
                  value={formData.mobile}
                  onChange={(e) => handleChange('mobile', e.target.value)}
                  disabled={loading}
                  className="bg-input-background border-border focus-visible:ring-ring"
                  autoComplete="tel"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('sections.address.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">{t('fields.address.label')}</Label>
              <Input
                id="address"
                placeholder={t('fields.address.placeholder')}
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                disabled={loading}
                className="bg-input-background border-border focus-visible:ring-ring"
                autoComplete="street-address"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">{t('fields.city.label')}</Label>
                <Input
                  id="city"
                  placeholder={t('fields.city.placeholder')}
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  disabled={loading}
                  className="bg-input-background border-border focus-visible:ring-ring"
                  autoComplete="address-level2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">{t('fields.state.label')}</Label>
                <Input
                  id="state"
                  placeholder={t('fields.state.placeholder')}
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  disabled={loading}
                  className="bg-input-background border-border focus-visible:ring-ring"
                  autoComplete="address-level1"
                />

              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">{t('fields.postalCode.label')}</Label>
                <Input
                  id="postalCode"

                  placeholder={t('fields.postalCode.placeholder')}
                  value={formData.postalCode}
                  onChange={(e) => handleChange('postalCode', e.target.value)}
                  disabled={loading}
                  className="bg-input-background border-border focus-visible:ring-ring"
                  autoComplete="postal-code"
                />

              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="countryCode">{t('fields.countryCode.label')}</Label>
              <Select value={formData.countryCode} onValueChange={(value) => handleChange('countryCode', value)} disabled={loading}>
                <SelectTrigger id="countryCode" className="bg-input-background border-border focus-visible:ring-ring">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ESP">{t('countries.ESP')}</SelectItem>
                  <SelectItem value="FRA">{t('countries.FRA')}</SelectItem>
                  <SelectItem value="PRT">{t('countries.PRT')}</SelectItem>
                  <SelectItem value="USA">{t('countries.USA')}</SelectItem>
                  <SelectItem value="MEX">{t('countries.MEX')}</SelectItem>
                </SelectContent>

              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>

            <CardTitle>{t('sections.sales.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">{t('fields.status.label')}</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange('status', value)} disabled={loading}>
                  <SelectTrigger id="status" className="bg-input-background border-border focus-visible:ring-ring">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">{t('status.new')}</SelectItem>
                    <SelectItem value="contacted">{t('status.contacted')}</SelectItem>
                    <SelectItem value="qualified">{t('status.qualified')}</SelectItem>
                    <SelectItem value="unqualified">{t('status.unqualified')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">{t('fields.priority.label')}</Label>
                <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)} disabled={loading}>
                  <SelectTrigger id="priority" className="bg-input-background border-border focus-visible:ring-ring">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t('priority.low')}</SelectItem>

                    <SelectItem value="medium">{t('priority.medium')}</SelectItem>
                    <SelectItem value="high">{t('priority.high')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="source">{t('fields.source.label')}</Label>
                <Select value={formData.source} onValueChange={(value) => handleChange('source', value)} disabled={loading}>
                  <SelectTrigger id="source" className="bg-input-background border-border focus-visible:ring-ring">
                    <SelectValue placeholder={t('fields.source.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">{t('source.website')}</SelectItem>
                    <SelectItem value="referral">{t('source.referral')}</SelectItem>
                    <SelectItem value="cold_call">{t('source.cold_call')}</SelectItem>
                    <SelectItem value="social_media">{t('source.social_media')}</SelectItem>
                    <SelectItem value="advertisement">{t('source.advertisement')}</SelectItem>
                    <SelectItem value="other">{t('source.other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interest">{t('fields.interest.label')}</Label>
              <Input
                id="interest"
                placeholder={t('fields.interest.placeholder')}
                value={formData.interest}
                onChange={(e) => handleChange('interest', e.target.value)}
                disabled={loading}
                className="bg-input-background border-border focus-visible:ring-ring"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimatedValue">{t('fields.estimatedValue.label')}</Label>
                <Input
                  id="estimatedValue"
                  type="number"

                  inputMode="decimal"
                  placeholder={t('fields.estimatedValue.placeholder')}
                  value={formData.estimatedValue}
                  onChange={(e) => handleChange('estimatedValue', e.target.value)}

                  disabled={loading}
                  className="bg-input-background border-border focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedCloseDate">{t('fields.estimatedCloseDate.label')}</Label>
                <Input

                  id="estimatedCloseDate"
                  type="date"
                  value={formData.estimatedCloseDate}
                  onChange={(e) => handleChange('estimatedCloseDate', e.target.value)}
                  disabled={loading}
                  className="bg-input-background border-border focus-visible:ring-ring"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t('fields.notes.label')}</Label>

              <Textarea
                id="notes"
                placeholder={t('fields.notes.placeholder')}
                rows={4}
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                disabled={loading}
                className="bg-input-background border-border focus-visible:ring-ring"
              />

            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onBack} disabled={loading}>
            {t('actions.cancel')}
          </Button>
          <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground">
            {loading ? t('actions.saving') : t('actions.save')}
          </Button>
        </div>
      </form>
    </div>
  );
}
