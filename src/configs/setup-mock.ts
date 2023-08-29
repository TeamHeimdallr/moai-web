import mockServiceWorker from '~/_mocks_';

mockServiceWorker.start({ onUnhandledRequest: 'bypass' });
