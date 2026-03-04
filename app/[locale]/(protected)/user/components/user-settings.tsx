'use client';

import { useMemo, useState, useTransition } from 'react';
import {
  Settings,
  Bell,
  Shield,

  Key,
  Mail,
  Smartphone,
  Eye,

  EyeOff,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { updatePassword } from './actions';


interface UserSettingsProps {
  open: boolean;

  onOpenChange: (open: boolean) => void;
}

type Strength = { score: number; label: string; badgeClass: string; barClass: string };


export function UserSettings({ open, onOpenChange }: UserSettingsProps) {
  const tSettings = useTranslations('settings');

  const tCommon = useTranslations('common');
  const tValidation = useTranslations('validation');
  const tErrors = useTranslations('errors');

  // Notifications
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [projectUpdates, setProjectUpdates] = useState(true);
  const [salesAlerts, setSalesAlerts] = useState(false);

  // Security
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(true);

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isPending, startTransition] = useTransition();

  const passwordStrength: Strength = useMemo(() => {
    const password = newPassword;
    if (!password) return { score: 0, label: '', badgeClass: '', barClass: '' };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;

    if (score <= 2) {
      return {
        score,
        label: tSettings('passwordWeak'),
        badgeClass: 'text-destructive bg-destructive/10',
        barClass: 'bg-destructive',
      };
    }
    if (score <= 3) {
      return {
        score,
        label: tSettings('passwordMedium'),
        badgeClass: 'text-warning bg-warning/10',
        barClass: 'bg-warning',
      };
    }
    return {
      score,
      label: tSettings('passwordStrong'),
      badgeClass: 'text-success bg-success/10',
      barClass: 'bg-success',
    };
  }, [newPassword, tSettings]);

  const passwordRequirements = useMemo(
    () => [
      { label: tSettings('passwordMinLength'), valid: newPassword.length >= 8 },
      { label: tSettings('passwordUppercase'), valid: /[A-Z]/.test(newPassword) },
      { label: tSettings('passwordLowercase'), valid: /[a-z]/.test(newPassword) },
      { label: tSettings('passwordNumber'), valid: /\d/.test(newPassword) },
      { label: tSettings('passwordSpecial'), valid: /[^a-zA-Z\d]/.test(newPassword) },
    ],
    [newPassword, tSettings]

  );


  const passwordsMatch = !!newPassword && !!confirmPassword && newPassword === confirmPassword;
  const passwordsDontMatch = !!confirmPassword && newPassword !== confirmPassword;

  const handleUpdatePassword = () => {
    if (!currentPassword) {
      toast.error(tValidation('required'), { description: tSettings('enterCurrentPassword') });
      return;
    }

    if (!newPassword) {
      toast.error(tValidation('required'), { description: tSettings('enterNewPassword') });
      return;
    }

    if (passwordStrength.score < 3) {
      toast.error(tSettings('passwordWeakError'), { description: tSettings('passwordWeakErrorDescription') });
      return;
    }

    if (!passwordsMatch) {
      toast.error(tValidation('passwordMismatch'), { description: tSettings('passwordsDontMatch') });
      return;
    }

    startTransition(async () => {
      try {
        await updatePassword({ currentPassword, newPassword });

        toast.success(tSettings('passwordUpdated'), { description: tSettings('passwordUpdatedDescription') });

        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
      } catch (e) {
        console.error(e);
        toast.error(tErrors('generic'), { description: tErrors('serverError') });

      }
    });
  };

  const handleSaveAll = () => {
    toast.success(tSettings('configurationSaved'), { description: tSettings('configurationSavedDescription') });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] max-h-[85vh] overflow-y-auto bg-background text-foreground">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold flex items-center gap-2 text-foreground">
            <Settings className="w-6 h-6 text-primary" />
            {tSettings('title')}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">

            {tSettings('subtitle')}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-card border border-border">
            <TabsTrigger value="account">{tSettings('account')}</TabsTrigger>
            <TabsTrigger value="notifications">{tSettings('notifications')}</TabsTrigger>
            <TabsTrigger value="security">{tSettings('security')}</TabsTrigger>
          </TabsList>

          {/* Account */}
          <TabsContent value="account" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-foreground">{tSettings('personalInfo')}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {tSettings('personalInfoDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-foreground">
                      {tSettings('firstName')}
                    </Label>
                    <Input id="firstName" defaultValue="Juan" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-foreground">
                      {tSettings('lastName')}
                    </Label>
                    <Input id="lastName" defaultValue="Pérez" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    {tSettings('emailLabel')}
                  </Label>
                  <Input id="email" type="email" defaultValue="juan@aqua.com" disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground">{tSettings('emailDisabledNote')}</p>

                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground">
                    {tSettings('phoneLabel')}

                  </Label>

                  <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position" className="text-foreground">
                    {tSettings('position')}

                  </Label>
                  <Input id="position" defaultValue="Administrador de Sistemas" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-foreground">
                  <Key className="w-4 h-4 text-primary" />
                  {tSettings('changePassword')}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {tSettings('changePasswordDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current */}
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-foreground">

                    {tSettings('currentPassword')}
                  </Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}

                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder={tSettings('enterCurrentPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showCurrentPassword ? tSettings('hidePassword') : tSettings('showPassword')}
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>

                  </div>
                </div>

                {/* New */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-foreground">
                    {tSettings('newPassword')}

                  </Label>

                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={tSettings('enterNewPassword')}
                    />
                    <button

                      type="button"
                      onClick={() => setShowNewPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showNewPassword ? tSettings('hidePassword') : tSettings('showPassword')}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {newPassword && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{tSettings('passwordStrength')}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${passwordStrength.badgeClass}`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${passwordStrength.barClass}`}
                          style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {newPassword && (
                    <div className="bg-muted/40 border border-border rounded-lg p-3 space-y-1.5">
                      <p className="text-xs font-medium text-foreground mb-2">{tSettings('passwordRequirements')}</p>
                      {passwordRequirements.map((req, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          {req.valid ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-muted-foreground" />
                          )}
                          <span className={req.valid ? 'text-success' : 'text-muted-foreground'}>{req.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Confirm */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-foreground">
                    {tSettings('confirmPassword')}
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"

                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={tSettings('confirmNewPassword')}
                    />

                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}

                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showConfirmPassword ? tSettings('hidePassword') : tSettings('showPassword')}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {confirmPassword && (
                    <div className="flex items-center gap-2">
                      {passwordsMatch ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-success" />
                          <span className="text-xs text-success">{tSettings('passwordsMatch')}</span>
                        </>
                      ) : passwordsDontMatch ? (
                        <>
                          <AlertCircle className="w-4 h-4 text-destructive" />
                          <span className="text-xs text-destructive">{tSettings('passwordsDontMatch')}</span>
                        </>
                      ) : null}
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleUpdatePassword}
                  disabled={isPending || !currentPassword || !newPassword || !passwordsMatch}
                  className="w-full gap-2"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {tSettings('updating')}
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      {tSettings('updatePassword')}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-4 mt-4">
            <Card>
              <CardHeader>

                <CardTitle className="text-base flex items-center gap-2 text-foreground">
                  <Bell className="w-4 h-4 text-primary" />
                  {tSettings('notificationsTitle')}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {tSettings('notificationsDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between gap-6">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <Label className="text-base font-medium text-foreground">{tSettings('emailNotifications')}</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">{tSettings('emailNotificationsDescription')}</p>
                  </div>
                  <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>

                <Separator />

                <div className="flex items-center justify-between gap-6">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-muted-foreground" />
                      <Label className="text-base font-medium text-foreground">{tSettings('pushNotifications')}</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">{tSettings('pushNotificationsDescription')}</p>
                  </div>
                  <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
                </div>

                <Separator />

                <div className="flex items-center justify-between gap-6">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium text-foreground">{tSettings('projectUpdates')}</Label>
                    <p className="text-sm text-muted-foreground">{tSettings('projectUpdatesDescription')}</p>
                  </div>
                  <Switch checked={projectUpdates} onCheckedChange={setProjectUpdates} />
                </div>

                <Separator />

                <div className="flex items-center justify-between gap-6">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium text-foreground">{tSettings('salesAlerts')}</Label>
                    <p className="text-sm text-muted-foreground">{tSettings('salesAlertsDescription')}</p>
                  </div>
                  <Switch checked={salesAlerts} onCheckedChange={setSalesAlerts} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>


          {/* Security */}
          <TabsContent value="security" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-foreground">
                  <Shield className="w-4 h-4 text-primary" />
                  {tSettings('securityTitle')}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {tSettings('securityDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between gap-6">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium text-foreground">{tSettings('twoFactor')}</Label>
                    <p className="text-sm text-muted-foreground">{tSettings('twoFactorDescription')}</p>
                  </div>
                  <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
                </div>

                <Separator />

                <div className="flex items-center justify-between gap-6">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium text-foreground">{tSettings('autoLogout')}</Label>
                    <p className="text-sm text-muted-foreground">{tSettings('autoLogoutDescription')}</p>
                  </div>
                  <Switch checked={sessionTimeout} onCheckedChange={setSessionTimeout} />
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="text-base font-medium text-foreground">{tSettings('activeSessions')}</Label>
                  <div className="border border-border rounded-lg p-4 space-y-3 bg-card">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {tSettings('sessionCurrent')}
                        </p>
                        <p className="text-xs text-muted-foreground">{tSettings('sessionCurrentMeta')}</p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-success/10 text-success rounded-full">
                        {tSettings('activeNow')}
                      </span>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {tSettings('sessionOther')}
                        </p>
                        <p className="text-xs text-muted-foreground">{tSettings('sessionOtherMeta')}</p>
                      </div>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                        {tSettings('closeSession')}
                      </Button>
                    </div>
                  </div>
                </div>

                <Button variant="destructive" size="sm" className="w-full">
                  {tSettings('closeAllSessions')}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            {tCommon('cancel')}
          </Button>
          <Button onClick={handleSaveAll} disabled={isPending}>
            {tSettings('saveChanges')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
