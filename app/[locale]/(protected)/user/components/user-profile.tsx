'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { Globe, Sun, Moon, Loader2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { useUser } from '@/components/providers/user-provider';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
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
} from '@/components/ui/dialog';

import { setLocaleCookie } from './actions';

interface UserProfileProps {
  open: boolean;

  onOpenChange: (open: boolean) => void;
}

type ThemeMode = 'light' | 'dark';

const LANGUAGES = [
  { code: 'es', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'en', nativeName: 'English', flag: '🇺🇸' },
  { code: 'fr', nativeName: 'Français', flag: '🇫🇷' },
] as const;

function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  const v = window.localStorage.getItem('theme');

  return v === 'dark' ? 'dark' : 'light';
}

function applyTheme(theme: ThemeMode) {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
  root.setAttribute('data-theme', theme);
  window.localStorage.setItem('theme', theme);
}

export function UserProfile({ open, onOpenChange }: UserProfileProps) {
  const tProfile = useTranslations('profile');
  const tCommon = useTranslations('common');
  const tUserMenu = useTranslations('userMenu');

  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const { user: contextUser, loading: loadingUser, refreshUser } = useUser();

  const [theme, setTheme] = useState<ThemeMode>('light');
  const [language, setLanguage] = useState<string>(locale);

  const [isPending, startTransition] = useTransition();

  useEffect(() => {

    setTheme(getStoredTheme());
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    setLanguage(locale);
  }, [locale]);

  const initials = useMemo(() => {
    const name = (contextUser?.displayName || '').trim();

    if (!name) return 'U';
    const parts = name.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0]?.toUpperCase() ?? 'U';
    const second = parts.length > 1 ? parts[parts.length - 1]?.[0]?.toUpperCase() : '';
    return `${first}${second}`.slice(0, 2);
  }, [contextUser?.displayName]);

  const handleSave = () => {
    startTransition(async () => {
      try {
        if (language !== locale) {
          await setLocaleCookie(language);
          router.push(pathname);
          return;
        }

        await refreshUser();
        toast.success(tProfile('preferencesSaved'), {
          description: tProfile('preferencesSavedDescription'),
        });
        onOpenChange(false);
      } catch (e) {
        console.error(e);
        toast.error(tProfile('errorTitle'), { description: tProfile('errorDescription') });
      }
    });
  };

  const langLabel =
    LANGUAGES.find((l) => l.code === language)?.nativeName ??
    LANGUAGES.find((l) => l.code === 'es')?.nativeName ??
    'Español';


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-130">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-foreground">{tProfile('title')}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {tProfile('subtitle')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* User info */}
          <div className="flex items-center gap-4 pb-4 border-b border-border">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center border border-border">
              {loadingUser ? (
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              ) : (
                <span className="text-2xl font-semibold text-secondary-foreground">{initials}</span>
              )}
            </div>

            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-foreground truncate">
                {loadingUser ? tCommon('loading') : contextUser?.displayName ?? tCommon('unknownUser')}
              </h3>
              <p className="text-sm text-muted-foreground truncate">{contextUser?.email ?? ''}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {contextUser?.roleLabel || tUserMenu('admin')}
              </p>
            </div>
          </div>

          {/* Language */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-foreground">
                <Globe className="w-4 h-4 text-primary" />

                {tProfile('language')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="language" className="text-foreground">
                  {tProfile('languageDescription')}
                </Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language">
                    <SelectValue>{langLabel}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <div className="flex items-center gap-2">
                          <span aria-hidden="true">{lang.flag}</span>
                          <span>{lang.nativeName}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Theme */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-foreground">
                {theme === 'light' ? (
                  <Sun className="w-4 h-4 text-primary" />
                ) : (
                  <Moon className="w-4 h-4 text-primary" />
                )}
                {tProfile('appearance')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Label className="text-foreground">{tProfile('appearanceDescription')}</Label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={[
                      'relative p-4 border-2 rounded-lg transition-all cursor-pointer',
                      theme === 'light'
                        ? 'border-primary bg-accent'
                        : 'border-border hover:border-muted-foreground/30',
                    ].join(' ')}
                  >

                    <div className="flex flex-col items-center gap-2">
                      <Sun className={['w-8 h-8', theme === 'light' ? 'text-primary' : 'text-muted-foreground'].join(' ')} />
                      <span className={['text-sm font-medium', theme === 'light' ? 'text-primary' : 'text-muted-foreground'].join(' ')}>
                        {tProfile('themeLight')}
                      </span>
                    </div>

                    {theme === 'light' && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>

                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={[
                      'relative p-4 border-2 rounded-lg transition-all cursor-pointer',
                      theme === 'dark'
                        ? 'border-primary bg-accent'
                        : 'border-border hover:border-muted-foreground/30',
                    ].join(' ')}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Moon className={['w-8 h-8', theme === 'dark' ? 'text-primary' : 'text-muted-foreground'].join(' ')} />
                      <span className={['text-sm font-medium', theme === 'dark' ? 'text-primary' : 'text-muted-foreground'].join(' ')}>
                        {tProfile('themeDark')}
                      </span>
                    </div>

                    {theme === 'dark' && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}

                  </button>

                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              {tCommon('cancel')}
            </Button>
            <Button onClick={handleSave} disabled={isPending} className="gap-2">
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {tProfile('saveChanges')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
