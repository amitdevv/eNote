import { Providers } from './providers';
import { AppRoutes } from './routes';
import { Toaster } from 'sonner';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';

function ThemedToaster() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  return (
    <Toaster
      position={isMobile ? 'top-center' : 'bottom-right'}
      duration={2600}
      gap={8}
      offset={16}
      visibleToasts={3}
      toastOptions={{
        classNames: {
          toast:
            '!bg-surface-panel !border !border-line-subtle !shadow-md !rounded-xl !text-ink-default !p-3 !pl-3.5 !gap-2.5 !min-h-0',
          title: '!text-preview !font-medium !text-ink-strong !leading-tight',
          description: '!text-caption !text-ink-muted !leading-snug !mt-0.5',
          icon: '!mr-0 !shrink-0 flex items-center',
          success: '',
          error: '',
        },
        style: { fontFamily: 'inherit' },
      }}
      icons={{
        success: (
          <span
            className="inline-flex items-center justify-center size-4 rounded-full"
            style={{ backgroundColor: 'var(--brand)' }}
          >
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden>
              <path
                d="M1 4l2.5 2.5L9 1"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        ),
        error: (
          <span className="inline-flex items-center justify-center size-4 rounded-full bg-red-600 text-white text-micro font-bold">
            !
          </span>
        ),
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
