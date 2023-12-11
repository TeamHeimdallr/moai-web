import { createRoot } from 'react-dom/client';

import 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import '~/configs/bigint';

import App from './app';

import '~/styles/index.css';
import 'react-toastify/dist/ReactToastify.min.css';

createRoot(document.getElementById('root') as HTMLElement).render(<App />);
