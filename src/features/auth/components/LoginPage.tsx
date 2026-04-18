import { useState } from 'react';
import { useAuth } from '@/features/auth/hooks';
import { Button } from '@/shared/components/ui/button';
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
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogle() {
    setLoading(true);
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error);
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Sky gradient base — sky on top AND bottom */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20"
        style={{
          background:
            'linear-gradient(180deg, #dbeafe 0%, #e0f2fe 20%, #f0f9ff 45%, #f0f9ff 55%, #e0f2fe 80%, #bae6fd 100%)',
        }}
      />
      {/* Soft sky glow top-left */}
      <div
        aria-hidden
        className="absolute -top-40 -left-40 w-[620px] h-[620px] rounded-full -z-10 blur-3xl opacity-60"
        style={{ background: 'radial-gradient(circle, #7dd3fc 0%, transparent 70%)' }}
      />
      {/* Soft sky glow bottom-right */}
      <div
        aria-hidden
        className="absolute -bottom-48 -right-40 w-[620px] h-[620px] rounded-full -z-10 blur-3xl opacity-70"
        style={{ background: 'radial-gradient(circle, #7dd3fc 0%, transparent 70%)' }}
      />
      {/* Soft sky glow bottom-left */}
      <div
        aria-hidden
        className="absolute -bottom-40 -left-32 w-[480px] h-[480px] rounded-full -z-10 blur-3xl opacity-55"
        style={{ background: 'radial-gradient(circle, #bae6fd 0%, transparent 70%)' }}
      />
      {/* Noise overlay */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 pointer-events-none opacity-[0.15] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      <div className="relative min-h-screen grid grid-cols-1 lg:grid-cols-2">
        {/* LEFT — Login form */}
        <div className="flex items-center justify-center p-6 lg:p-10">
          <div className="w-full max-w-[400px]">
            {/* Logo */}
            <div className="flex justify-center lg:justify-start mb-8">
              <div className="size-12 rounded-2xl bg-brand flex items-center justify-center text-white font-semibold text-[16px] shadow-lg shadow-brand/20">
                eN
              </div>
            </div>

            {/* Hero */}
            <div className="text-center lg:text-left mb-8">
              <h1 className="text-[30px] leading-[1.15] font-semibold text-ink-strong tracking-[-0.02em]">
                Welcome to <span className="text-brand">eNote</span>
              </h1>
              <p className="mt-3 text-title leading-[1.5] text-ink-muted">
                A calm home for your notes, tasks, and fleeting thoughts.
              </p>
            </div>

            <Button
              variant="outline"
              size="lg"
              className="w-full gap-3 h-14 rounded-xl border-2 border-ink-strong/80 !bg-white hover:!bg-surface-muted text-title font-semibold text-ink-strong shadow-[0_10px_28px_-10px_rgba(14,165,233,0.35)] hover:shadow-[0_14px_32px_-10px_rgba(14,165,233,0.45)] transition-shadow duration-200"
              onClick={handleGoogle}
              disabled={loading}
            >
              {loading ? <Spinner /> : <GoogleIcon />}
              <span>Continue with Google</span>
            </Button>

            {error && (
              <p className="mt-3 text-caption text-red-600 text-center">{error}</p>
            )}
          </div>
        </div>

        {/* RIGHT — Quote panel (hidden on mobile) */}
        <div className="hidden lg:flex items-center justify-center p-12 relative">
          {/* Decorative vertical divider */}
          <div
            aria-hidden
            className="absolute left-0 top-1/2 -translate-y-1/2 h-[60%] w-px bg-gradient-to-b from-transparent via-ink-subtle/20 to-transparent"
          />

          <figure className="max-w-[480px]">
            {/* Big opening quote mark */}
            <div
              aria-hidden
              className="mb-2 text-[80px] leading-none font-serif text-brand/30 select-none"
            >
              &ldquo;
            </div>

            <blockquote className="text-[28px] leading-[1.4] font-medium text-ink-strong tracking-[-0.01em]">
              I don't know what I think until I write it down.
            </blockquote>

            <figcaption className="mt-6 flex items-center gap-3">
              <span className="h-px w-8 bg-ink-subtle/40" />
              <span className="text-preview text-ink-muted tracking-wide uppercase">
                Joan Didion
              </span>
            </figcaption>

            <p className="mt-10 text-nav leading-[1.6] text-ink-muted">
              Writing is thinking. eNote gives your ideas a place to land, so
              you can come back to them, connect them, and keep building.
            </p>
          </figure>
        </div>
      </div>
    </div>
  );
}
