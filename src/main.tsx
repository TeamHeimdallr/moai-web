import { createRoot, hydrateRoot } from 'react-dom/client';

import '~/configs/bigint';

import App from './app';

import '~/styles/index.css';
import 'react-toastify/dist/ReactToastify.min.css';
import 'react-loading-skeleton/dist/skeleton.css';

// createRoot(document.getElementById('root') as HTMLElement).render(<App />);

const rootElement = document.getElementById('root') as HTMLElement;
const root = createRoot(rootElement!);

// react-snap configs for dynamic meta tags - https://github.com/stereobooster/react-snap
if (rootElement?.hasChildNodes()) hydrateRoot(rootElement, <App />);
else root.render(<App />);
