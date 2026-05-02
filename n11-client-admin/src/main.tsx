import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import App from '@/App';
import { queryClient } from '@/shared/lib/api/query';
import '@/index.css';

// StrictMode kapalı: çift istek/effect istemiyoruz.
createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <App />
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  </QueryClientProvider>,
);
