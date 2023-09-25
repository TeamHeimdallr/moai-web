import { lazy } from 'react';
import { Route, Routes as ReactRoutes } from 'react-router-dom';

import { useConnectXrpl } from './hooks/data/use-connect-xrpl';

const TestPage = lazy(() => import('./pages/xrpl-test'));

const MoaiEVM = () => {
  useConnectXrpl();

  return (
    <ReactRoutes>
      <Route path="/" element={<TestPage />} />
    </ReactRoutes>
  );
};

export default MoaiEVM;
