import { createRoot } from 'react-dom/client';

import '~/configs/polyfill-wallet';

import '~/styles/index.css';

import('react-toastify/dist/ReactToastify.min.css');
import('~/app').then(({ default: App }) =>
  createRoot(document.getElementById('root') as HTMLElement).render(<App />)
);
