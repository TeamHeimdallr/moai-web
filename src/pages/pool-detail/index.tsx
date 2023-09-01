import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

const PoolDetailAddLiquidityPage = lazy(() => import('./pages/add-liquidity'));
const PoolDetailMainPage = lazy(() => import('./pages/main'));

const PoolDetailPage = () => {
  return (
    <Routes>
      <Route path="/:id" element={<PoolDetailMainPage />} />
      <Route path="/:id/liquidity" element={<PoolDetailAddLiquidityPage />} />
    </Routes>
  );
};

export default PoolDetailPage;
