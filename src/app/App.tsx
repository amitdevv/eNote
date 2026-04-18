import { Providers } from './providers';
import { AppRoutes } from './routes';
import { Toaster } from 'sonner';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';

function ThemedToaster() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  return (
    <Toaster
      position={isMobile ? 'top-center' : 'bottom-right'}
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
  );
}

export default function App() {
  return (
    <Providers>
      <AppRoutes />
      <ThemedToaster />
    </Providers>
  );
}
