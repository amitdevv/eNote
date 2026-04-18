import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/hooks';
import { useProfile, useUpdateProfile, useDeleteAccount } from '../hooks';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { ConfirmDialog } from '@/shared/components/ui/dialog';
import {
  SettingsSection,
  SettingsRow,
  SettingsDivider,
} from '@/features/settings/components/SettingsSection';

function Avatar({
  displayName,
  email,
  avatarUrl,
}: {
  displayName: string | null;
  email: string | null;
  avatarUrl: string | null;
}) {
  const source = (displayName || email || '?').trim();
  const initials = source.slice(0, 2).toUpperCase();
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [avatarUrl]);

  if (avatarUrl && !broken) {
    return (
      <img
        src={avatarUrl}
        onError={() => setBroken(true)}
        alt=""
        className="size-12 rounded-full object-cover border border-line-subtle"
      />
    );
  }
  return (
    <div className="size-12 rounded-full bg-brand flex items-center justify-center text-[16px] font-medium text-white">
      {initials}
    </div>
  );
}

export function AccountSettings() {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const update = useUpdateProfile();
  const del = useDeleteAccount();

  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? '');
      setAvatarUrl(profile.avatar_url ?? '');
    }
  }, [profile]);

  const dirty =
    profile !== undefined &&
    (displayName !== (profile.display_name ?? '') ||
      avatarUrl !== (profile.avatar_url ?? ''));

  async function save() {
    try {
      await update.mutateAsync({
        display_name: displayName,
        avatar_url: avatarUrl,
      });
      toast.success('Profile updated');
    } catch (e) {
      toast.error('Could not save profile', {
        description: e instanceof Error ? e.message : undefined,
      });
    }
  }

  async function handleDelete() {
    try {
      await del.mutateAsync();
      toast.success('Account deleted');
    } catch (e) {
      toast.error('Could not delete account', {
        description: e instanceof Error ? e.message : undefined,
      });
      throw e;
    }
  }

  return (
    <>
      <SettingsSection title="Account">
        {isLoading ? (
          <div className="px-4 py-6 text-[13px] text-ink-muted">Loading…</div>
        ) : (
          <>
            <div className="flex items-center gap-4 px-4 py-4">
              <Avatar
                displayName={displayName || profile?.display_name || null}
                email={user?.email ?? null}
                avatarUrl={avatarUrl || null}
              />
              <div className="min-w-0">
                <p className="text-[14px] text-ink-strong truncate">
                  {displayName || profile?.display_name || user?.email?.split('@')[0] || 'You'}
                </p>
                <p className="text-[12px] text-ink-muted truncate">{user?.email}</p>
              </div>
            </div>
            <SettingsDivider />

            <div className="px-4 py-3.5 flex flex-col gap-2">
              <label className="text-[12px] font-medium text-ink-muted" htmlFor="display-name">
                Display name
              </label>
              <Input
                id="display-name"
                placeholder="Your name"
                value={displayName}
                maxLength={60}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            <SettingsDivider />

            <div className="px-4 py-3.5 flex flex-col gap-2">
              <label className="text-[12px] font-medium text-ink-muted" htmlFor="avatar-url">
                Avatar URL
              </label>
              <Input
                id="avatar-url"
                type="url"
                placeholder="https://…"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
              />
              <p className="text-[12px] text-ink-subtle">
                Paste an image URL. Leave empty to fall back to your initials.
              </p>
            </div>

            <SettingsDivider />

            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                Sign out
              </Button>
              <Button
                size="sm"
                onClick={save}
                disabled={!dirty || update.isPending}
              >
                {update.isPending ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </>
        )}
      </SettingsSection>

      <SettingsSection
        title="Danger zone"
        description="Permanently delete your account and every note in it. This cannot be undone."
      >
        <SettingsRow
          label="Delete account"
          hint="Removes your profile, notes, labels, and highlights."
        >
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setConfirmDelete(true)}
          >
            Delete account
          </Button>
        </SettingsRow>
      </SettingsSection>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete your account?"
        description="This permanently removes your profile and every note, label, and highlight. There is no undo."
        confirmLabel={del.isPending ? 'Deleting…' : 'Delete account'}
        destructive
        onConfirm={handleDelete}
      />
    </>
  );
}
