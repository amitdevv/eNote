import { Component, type ReactNode } from 'react';
import { Button } from '@/shared/components/ui/button';

type State = { error: Error | null };

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    // eslint-disable-next-line no-console
    console.error('[eNote] render crash:', error, info);
  }

  reset = () => {
    this.setState({ error: null });
  };

  hardReload = () => {
    window.location.href = '/notes';
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-app p-6">
        <div className="w-full max-w-[420px] rounded-xl border border-line-subtle bg-surface-panel shadow-sm p-6">
          <p className="text-[15px] font-semibold text-ink-strong">Something went wrong.</p>
          <p className="mt-1 text-[13px] text-ink-muted">
            A rendering error happened. Your notes are safe — they auto-save to Supabase.
          </p>
          <pre className="mt-3 rounded-md bg-surface-muted p-3 text-[11px] text-ink-muted overflow-x-auto max-h-40">
            {this.state.error.message}
          </pre>
          <div className="mt-4 flex items-center gap-2">
            <Button size="sm" onClick={this.reset}>
              Try again
            </Button>
            <Button size="sm" variant="ghost" onClick={this.hardReload}>
              Reload app
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
