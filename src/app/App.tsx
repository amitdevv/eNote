import { Providers } from './providers';
import { AppRoutes } from './routes';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <Providers>
      <AppRoutes />
      <Toaster position="bottom-right" richColors closeButton />
    </Providers>
  );
}
