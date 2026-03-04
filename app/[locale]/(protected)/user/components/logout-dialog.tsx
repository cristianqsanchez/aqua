'use client';

import { LogOut, AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,

  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface LogoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
}

export function LogoutDialog({ open, onOpenChange, onConfirm }: LogoutDialogProps) {
  const tLogout = useTranslations('logout');
  const tCommon = useTranslations('common');

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-background text-foreground">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
              <LogOut className="w-6 h-6 text-destructive" />

            </div>
            <div>
              <AlertDialogTitle className="text-xl text-foreground">
                {tLogout('confirmTitle')}
              </AlertDialogTitle>
            </div>
          </div>

          <AlertDialogDescription className="text-base pt-2 text-muted-foreground">
            {tLogout('confirmDescription')}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 my-4">
          <div className="flex gap-2">
            <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <div className="text-sm text-foreground">
              <p className="font-medium">{tLogout('rememberTitle')}</p>
              <p className="text-muted-foreground mt-1">{tLogout('rememberDescription')}</p>
            </div>
          </div>

        </div>

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">{tCommon('cancel')}</Button>
          </AlertDialogCancel>

          <AlertDialogAction asChild>

            <Button variant="destructive" onClick={onConfirm} className="gap-2">
              <LogOut className="w-4 h-4" />
              {tLogout('confirmButton')}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
