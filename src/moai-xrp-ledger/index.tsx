import { lazy } from 'react';
import { Navigate, Route, Routes as ReactRoutes } from 'react-router-dom';

import { useConnectXrpl } from './hooks/data/use-connect-xrpl';

const HomePage = lazy(() => import('./pages/home'));

const MoaiXrpl = () => {
  useConnectXrpl();

  return (
    <ReactRoutes>
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </ReactRoutes>
  );
};

export default MoaiXrpl;
