import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAuth } from '@/contexts/AuthContext';
import {
  Settings,
  Type,
  Trash2,
  Download,
  RotateCcw,
  User,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle,
} from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { FontSelector } from '@/components/ui/font-selector';
import { FontSizeSelector } from '@/components/ui/font-size-selector';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type SectionProps = {
  icon: React.ElementType;
  title: string;
  description: string;
  iconClassName?: string;
  children: React.ReactNode;
};

const Section: React.FC<SectionProps> = ({ icon: Icon, title, description, iconClassName, children }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Icon className={cn('w-5 h-5', iconClassName)} />
        {title}
      </CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">{children}</CardContent>
  </Card>
);

type RowProps = {
  label: string;
  description: string;
  children: React.ReactNode;
  tone?: 'default' | 'danger' | 'warning';
};

const toneStyles = {
  default: 'border-subtle',
  danger: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20',
  warning: 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20',
};

const Row: React.FC<RowProps> = ({ label, description, children, tone = 'default' }) => (
  <div
    className={cn(
      'flex items-center justify-between',
      tone !== 'default' && 'p-4 border rounded-lg',
      toneStyles[tone]
    )}
  >
    <div className="space-y-1">
      <Label className="text-sm font-medium">{label}</Label>
      <p className="text-xs text-subtle-inv">{description}</p>
    </div>
    {children}
  </div>
);

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const {
    defaultFont,
    defaultFontSize,
    setDefaultFont,
    setDefaultFontSize,
    clearAllData,
    exportAllData,
    resetToDefaults,
  } = useSettingsStore();

  const [isClearing, setIsClearing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleClear = async () => {
    setIsClearing(true);
    try { await clearAllData(); } finally { setIsClearing(false); }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try { await exportAllData(); } finally { setIsExporting(false); }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch {
      toast.error('Failed to sign out');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-6 h-6 text-subtle-inv" />
          <h1 className="text-2xl font-bold text-primary-inv">Settings</h1>
        </div>
        <p className="text-subtle-inv">
          Customize your <span style={{ fontFamily: 'Inconsolata, monospace' }}>eNote</span> experience
        </p>
      </div>

      <Section icon={Type} title="Editor" description="Defaults applied to new notes">
        <Row label="Default Font" description="Font family used for new notes">
          <FontSelector currentFont={defaultFont} onFontChange={setDefaultFont} />
        </Row>
        <Separator />
        <Row label="Default Font Size" description="Font size used for new notes">
          <FontSizeSelector currentSize={defaultFontSize} onSizeChange={setDefaultFontSize} />
        </Row>
      </Section>

      <Section icon={FileText} title="Data" description="Export, back up, or clear your notes">
        <Row label="Export All Data" description="Download a JSON backup of all your notes">
          <Button onClick={handleExport} disabled={isExporting} size="sm" variant="outline">
            {isExporting ? <Clock className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Export
          </Button>
        </Row>

        <Row
          tone="danger"
          label="Clear All Data"
          description="Permanently delete all your notes. This cannot be undone."
        >
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={isClearing}>
                {isClearing ? <Clock className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                Clear All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  Clear All Data
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all your notes and cannot be undone. Are you sure?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClear} className="bg-red-600 hover:bg-red-700">
                  Yes, Delete All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Row>
      </Section>

      <Section icon={User} title="Account" description="Your signed-in account">
        <Row label="Signed in as" description={`${user?.user_metadata?.full_name || 'User'} • ${user?.email}`}>
          <Badge variant="secondary">
            <CheckCircle className="w-3 h-3 mr-1" />
            Authenticated
          </Badge>
        </Row>
        <Separator />
        <Row label="Sign Out" description="Sign out of your account">
          <Button onClick={handleSignOut} variant="outline" size="sm">Sign Out</Button>
        </Row>
      </Section>

      <Section
        icon={RotateCcw}
        title="Reset Settings"
        description="Reset font preferences to defaults"
        iconClassName="text-orange-600 dark:text-orange-400"
      >
        <Row
          tone="warning"
          label="Reset to Defaults"
          description="Your notes are not affected — only settings"
        >
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="border-orange-300 text-orange-600 hover:bg-orange-50">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset Settings</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reset all settings to their default values. Your notes will not be affected.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={resetToDefaults}>Reset Settings</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Row>
      </Section>
    </div>
  );
};
