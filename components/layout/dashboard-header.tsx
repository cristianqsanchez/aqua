'use client';

import { useMemo, useState, useTransition } from 'react';
import { ChevronDown, Loader2, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { useUser } from '@/components/providers/user-provider';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { UserProfile } from '@/app/[locale]/(protected)/user/components/user-profile';
import { UserSettings } from '@/app/[locale]/(protected)/user/components/user-settings';
import { LogoutDialog } from '@/app/[locale]/(protected)/user/components/logout-dialog';

import { signOut } from './header.actions';


export function Header() {
  const tUserMenu = useTranslations('userMenu');
  const tLogout = useTranslations('logout');
  const tCommon = useTranslations('common');

  const { user, loading: loadingUser } = useUser();

  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const [isPending, startTransition] = useTransition();

  const initials = useMemo(() => {
    const name = (user?.displayName || '').trim();

    if (!name) return 'U';
    const parts = name.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0]?.toUpperCase() ?? 'U';
    const second = parts.length > 1 ? parts[parts.length - 1]?.[0]?.toUpperCase() : '';
    return `${first}${second}`.slice(0, 2);
  }, [user?.displayName]);


  const handleLogout = async () => {
    startTransition(async () => {
      try {

        await signOut();

        toast.success(tLogout('title'), {
          description: tLogout('description'),
        });
      } catch (error) {
        console.error('Logout error:', error);
        toast.error(tLogout('errorTitle'), {
          description: tLogout('errorDescription'),
        });
      }
    });
  };

  return (
    <>
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
        <div className="flex items-center gap-4">{/* Logo / Slot */}</div>

        <div className="flex items-center gap-3">

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center border border-border">
                  {loadingUser ? (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  ) : (
                    <span className="text-xs font-semibold text-secondary-foreground">{initials}</span>
                  )}
                </div>

                <div className="text-left">
                  <div className="text-sm font-medium text-foreground">
                    {loadingUser ? tCommon('loading') : user?.displayName ?? tCommon('unknownUser')}
                  </div>
                  <div className="text-xs text-muted-foreground">{user?.email ?? ''}</div>
                </div>

                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => setShowProfile(true)}>
                <UserIcon className="w-4 h-4 mr-2" />
                {tUserMenu('myProfile')}
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setShowSettings(true)}>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}

                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {tUserMenu('configuration')}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                onClick={() => setShowLogoutDialog(true)}
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"

                  />
                </svg>
                {tUserMenu('logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <UserProfile open={showProfile} onOpenChange={setShowProfile} />
      <UserSettings open={showSettings} onOpenChange={setShowSettings} />
      <LogoutDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        onConfirm={handleLogout}
        loading={isPending}
      />
    </>

  );
}
