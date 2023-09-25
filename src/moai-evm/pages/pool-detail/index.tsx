import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

const PoolDetailMainPage = lazy(() => import('./pages/main'));
const PoolDetailAddLiquidityPage = lazy(() => import('./pages/add-liquidity'));
const PoolDetailWithdrawLiquidityPage = lazy(() => import('./pages/withdraw-liquidity'));

const PoolDetailPage = () => {
  return (
    <Routes>
      <Route path="/:id" element={<PoolDetailMainPage />} />
      <Route path="/:id/liquidity" element={<PoolDetailAddLiquidityPage />} />
      <Route path="/:id/withdraw" element={<PoolDetailWithdrawLiquidityPage />} />
    </Routes>
  );
};

export default PoolDetailPage;
