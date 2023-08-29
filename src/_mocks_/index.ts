import { setupWorker } from 'msw';

import mockAPIs from './api-server';

const mockServiceWorker = setupWorker(...mockAPIs);
export default mockServiceWorker;
