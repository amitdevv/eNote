import { Providers } from './providers';
import { AppRoutes } from './routes';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <Providers>
      <AppRoutes />
      <Toaster
        position="bottom-right"
        closeButton
        toastOptions={{
          classNames: {
            toast:
              'bg-surface-panel border border-line-default shadow-md rounded-lg text-ink-default',
            title: 'text-[13px] font-medium text-ink-strong',
            description: 'text-[12px] text-ink-muted',
            closeButton: 'text-ink-subtle hover:text-ink-strong',
          },
          style: { fontFamily: 'inherit' },
        }}
      />
    </Providers>
  );
}
