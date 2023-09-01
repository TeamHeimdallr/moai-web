import '~/styles/index.css';
import '~/configs/polyfill-wallet';

import { createRoot } from 'react-dom/client';

import('react-toastify/dist/ReactToastify.min.css');
import('~/app').then(({ default: App }) =>
  createRoot(document.getElementById('root') as HTMLElement).render(<App />)
);
