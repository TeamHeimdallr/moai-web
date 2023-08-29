import '~/styles/index.css';
import '~/configs/polyfill-wallet';

import { createRoot } from 'react-dom/client';

import { IS_MOCK } from '~/constants';

if (IS_MOCK) import('~/configs/setup-mock');

import('~/app').then(({ default: App }) =>
  createRoot(document.getElementById('root') as HTMLElement).render(<App />)
);
