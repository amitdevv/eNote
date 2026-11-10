import { useState } from 'react';
import { useAuth } from '@/features/auth/hooks';
import { Spinner } from '@/shared/components/ui/spinner';
import './LoginPage.css';

function Arrow() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
export function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function handleStart() {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithGoogle();
      if (result.error) { setError(result.error); setLoading(false); }
    } catch { setError('Couldn’t open sign-in. Please try again.'); setLoading(false); }
  }
  return (
    <div className="en-site" id="top">
      <a className="en-skip" href="#main">Skip to content</a>
      <main id="main">
        <section className="en-hero" aria-labelledby="hero-heading">
          <div className="en-copy">
            <p className="en-eyebrow"><span aria-hidden="true">✳</span> YOUR EVERYDAY NOTEBOOK</p>
            <h1 id="hero-heading">A home for<br /><em>your thoughts.</em></h1>
            <p className="en-description">Keep your ideas. Remember what matters.</p>
            <div className="en-hero-actions">
              <button className="en-button" onClick={handleStart} disabled={loading}>
                {loading && <Spinner />}{loading ? 'Opening sign-in…' : 'Remember what matters'}<Arrow />
              </button>
            </div>
            {error && <p className="en-error" role="alert">{error}</p>}
          </div>
          <div className="en-art" aria-hidden="true">
            <img className="en-notebook" src="/assets/images/concepts/enote-stationery-upright.png" alt="" width="1310" height="1201" fetchPriority="high" />
          </div>
        </section>
      </main>

    </div>
  );
}
