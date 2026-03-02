'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Droplets, Mail, Lock, Loader2 } from 'lucide-react';
import { login } from './actions';

export default function Login() {
  const t = useTranslations('auth');
  const [pending, setPending] = useState(false);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg">

            <Droplets className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('systemName')}</h1>
          <p className="text-muted-foreground">{t('systemDescription')}</p>
        </div>

        <div className="bg-card text-card-foreground rounded-2xl shadow-xl border border-border p-8">

          <div className="mb-6">

            <h2 className="text-2xl font-semibold text-foreground mb-1">{t('loginTitle')}</h2>
            <p className="text-sm text-muted-foreground">{t('loginSubtitle')}</p>
          </div>

          <form

            action={async (formData) => {
              setPending(true);
              try {
                await login(formData);
              } finally {

                setPending(false);
              }
            }}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                {t('emailLabel')}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input

                  id="email"
                  name="email"
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  required
                  disabled={pending}
                  className="pl-10 h-11 bg-input-background border-border focus-visible:ring-ring"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                {t('passwordLabel')}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder={t('passwordPlaceholder')}
                  required
                  disabled={pending}
                  className="pl-10 h-11 bg-input-background border-border focus-visible:ring-ring"
                  autoComplete="current-password"

                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={pending}
              className="w-full h-11 bg-primary text-primary-foreground font-medium shadow-md hover:shadow-lg transition-all duration-200"
            >

              {pending ? (

                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('signingIn')}
                </>
              ) : (
                t('signInButton')
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-center text-muted-foreground">
              {t('noAccountText')}{' '}
              <span className="text-primary font-medium">{t('contactAdmin')}</span>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">{t('footerText')}</p>
        </div>
      </div>
    </div>
  );
}
