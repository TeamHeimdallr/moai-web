import { createRoot } from 'react-dom/client';

import '~/configs/bigint';

import App from './app';

import '~/styles/index.css';
import 'react-toastify/dist/ReactToastify.min.css';
import 'react-loading-skeleton/dist/skeleton.css';

createRoot(document.getElementById('root') as HTMLElement).render(<App />);
