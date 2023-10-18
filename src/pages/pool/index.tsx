import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

const PoolDetail = lazy(() => import('./pages/detail'));
const PoolDetailAddLiquidity = lazy(() => import('./pages/add-liquidity'));
const PoolDetailWithdrawLiquidity = lazy(() => import('./pages/withdraw-liquidity'));

const PoolDetailPage = () => {
  return (
    <Routes>
      <Route path="/:id" element={<PoolDetail />} />
      <Route path="/:id/deposit" element={<PoolDetailAddLiquidity />} />
      <Route path="/:id/withdraw" element={<PoolDetailWithdrawLiquidity />} />
    </Routes>
  );
};

export default PoolDetailPage;
