import { useState, type FormEvent } from 'react';
import { useAuth } from '@/features/auth/hooks';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Spinner } from '@/shared/components/ui/spinner';

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export function LoginPage() {
  const { signInWithMagicLink, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'google' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function submitEmail(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('sending');
    setError(null);
    const { error } = await signInWithMagicLink(email.trim());
    if (error) {
      setStatus('error');
      setError(error);
    } else {
      setStatus('sent');
    }
  }

  async function handleGoogle() {
    setStatus('google');
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) {
      setStatus('error');
      setError(error);
    }
  }

  return (
    <div className="min-h-screen bg-surface-app flex items-center justify-center p-6">
      <div className="w-full max-w-[360px]">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 size-10 rounded-xl bg-brand flex items-center justify-center text-white font-medium">
            eN
          </div>
          <h1 className="text-[18px] font-semibold text-ink-strong tracking-tight">eNote</h1>
          <p className="mt-1 text-[13px] text-ink-muted">Sign in to continue</p>
        </div>

        {status === 'sent' ? (
          <div className="rounded-xl border border-line-subtle bg-surface-panel shadow-sm p-5 text-center">
            <p className="text-[13px] text-ink-strong font-medium">Check your email</p>
            <p className="mt-1 text-[12px] text-ink-muted">
              We sent a magic link to <span className="text-ink-default">{email}</span>.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <Button
              variant="outline"
              size="lg"
              className="w-full gap-2"
              onClick={handleGoogle}
              disabled={status === 'google' || status === 'sending'}
            >
              {status === 'google' ? <Spinner /> : <GoogleIcon />}
              <span>Continue with Google</span>
            </Button>

            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-ink-subtle">
              <div className="h-px flex-1 bg-line-default" />
              <span>or</span>
              <div className="h-px flex-1 bg-line-default" />
            </div>

            <form onSubmit={submitEmail} className="space-y-2.5">
              <Input
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'sending'}
                className="h-10 text-sm"
              />
              <Button
                type="submit"
                size="lg"
                variant="default"
                className="w-full"
                disabled={status === 'sending' || !email.trim()}
              >
                {status === 'sending' ? <Spinner className="border-white/40 border-t-white" /> : 'Send magic link'}
              </Button>
            </form>

            {error && <p className="text-[12px] text-red-600">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
