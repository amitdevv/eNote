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
  Palette,
  Shield,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { FontSelector } from '@/components/ui/font-selector';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const {
    defaultFont,
    autoSave,
    autoSaveInterval,
    confirmDelete,
    showWordCount,
    compactMode,
    showPreview,
    setDefaultFont,
    setAutoSave,
    setAutoSaveInterval,
    setConfirmDelete,
    setShowWordCount,
    setCompactMode,
    setShowPreview,
    clearAllData,
    exportAllData,
    resetToDefaults,
  } = useSettingsStore();

  const [isClearing, setIsClearing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleClearAllData = async () => {
    setIsClearing(true);
    try {
      await clearAllData();
    } finally {
      setIsClearing(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      await exportAllData();
    } finally {
      setIsExporting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400">
          Customize your eNote experience
        </p>
      </div>

        {/* Editor Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="w-5 h-5" />
              Editor Settings
            </CardTitle>
            <CardDescription>
              Customize your writing experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Default Font */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Default Font</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Font family used for new notes
                </p>
              </div>
              <FontSelector 
                currentFont={defaultFont} 
                onFontChange={setDefaultFont}
              />
            </div>

            <Separator />

            {/* Auto Save */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Auto Save</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Automatically save notes while typing
                </p>
              </div>
              <Switch
                checked={autoSave}
                onCheckedChange={setAutoSave}
              />
            </div>

            {/* Auto Save Interval */}
            {autoSave && (
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Auto Save Interval</Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    How often to save changes (in seconds)
                  </p>
                </div>
                <Select value={autoSaveInterval.toString()} onValueChange={(value) => setAutoSaveInterval(Number(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1s</SelectItem>
                    <SelectItem value="2">2s</SelectItem>
                    <SelectItem value="3">3s</SelectItem>
                    <SelectItem value="5">5s</SelectItem>
                    <SelectItem value="10">10s</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Separator />

            {/* Show Word Count */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Show Word Count</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Display word count in editor
                </p>
              </div>
              <Switch
                checked={showWordCount}
                onCheckedChange={setShowWordCount}
              />
            </div>
          </CardContent>
        </Card>

        {/* UI Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Interface Settings
            </CardTitle>
            <CardDescription>
              Customize the app interface
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Compact Mode */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Compact Mode</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Reduce spacing for more content on screen
                </p>
              </div>
              <Switch
                checked={compactMode}
                onCheckedChange={setCompactMode}
              />
            </div>

            <Separator />

            {/* Show Preview */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Show Preview</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Show markdown preview in editor
                </p>
              </div>
              <Switch
                checked={showPreview}
                onCheckedChange={setShowPreview}
              />
            </div>
          </CardContent>
        </Card>

        {/* Safety Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Safety Settings
            </CardTitle>
            <CardDescription>
              Protect your data and prevent accidents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Confirm Delete */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Confirm Delete</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Show confirmation dialog before deleting notes
                </p>
              </div>
              <Switch
                checked={confirmDelete}
                onCheckedChange={setConfirmDelete}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Data Management
            </CardTitle>
            <CardDescription>
              Export, backup, or clear your data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Export Data */}
            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Export All Data</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Download a backup of all your notes and settings
                </p>
              </div>
              <Button 
                onClick={handleExportData}
                disabled={isExporting}
                size="sm"
                variant="outline"
              >
                {isExporting ? (
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Export
              </Button>
            </div>

            {/* Clear All Data */}
            <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950/20">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-red-700 dark:text-red-400">Clear All Data</Label>
                <p className="text-xs text-red-600 dark:text-red-500">
                  Permanently delete all your notes. This cannot be undone.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive"
                    size="sm"
                    disabled={isClearing}
                  >
                    {isClearing ? (
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
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
                      This will permanently delete all your notes and cannot be undone. 
                      Are you sure you want to continue?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleClearAllData}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Yes, Delete All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Account Settings
            </CardTitle>
            <CardDescription>
              Manage your account and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* User Info */}
            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Account</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.user_metadata?.full_name || 'User'} • {user?.email}
                </p>
              </div>
              <Badge variant="secondary">
                <CheckCircle className="w-3 h-3 mr-1" />
                Authenticated
              </Badge>
            </div>

            {/* Sign Out */}
            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Sign Out</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Sign out of your account
                </p>
              </div>
              <Button 
                onClick={handleSignOut}
                variant="outline"
                size="sm"
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reset Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
              <RotateCcw className="w-5 h-5" />
              Reset Settings
            </CardTitle>
            <CardDescription>
              Reset all settings to their default values
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border border-orange-200 dark:border-orange-800 rounded-lg bg-orange-50 dark:bg-orange-950/20">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-orange-700 dark:text-orange-400">Reset to Defaults</Label>
                <p className="text-xs text-orange-600 dark:text-orange-500">
                  This will reset all settings but won't affect your notes
                </p>
              </div>
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
                    <AlertDialogAction onClick={resetToDefaults}>
                      Reset Settings
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}; 