import { lazy } from 'react';
import { Navigate, Route, Routes as ReactRoutes } from 'react-router-dom';

const HomePage = lazy(() => import('./pages/home'));
const PoolDetailPage = lazy(() => import('./pages/pool-detail'));
const SwapPage = lazy(() => import('./pages/swap'));

const MoaiEVM = () => {
  return (
    <ReactRoutes>
      <Route path="/" element={<HomePage />} />
      <Route path="/swap" element={<SwapPage />} />
      <Route path="/pools/*" element={<PoolDetailPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </ReactRoutes>
  );
};

export default MoaiEVM;
