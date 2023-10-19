import { Route, Routes } from 'react-router-dom';

import PoolDetailAddLiquidity from './pages/add-liquidity';
import PoolDetail from './pages/detail';
import PoolDetailWithdrawLiquidity from './pages/withdraw-liquidity';

const PoolDetailPage = () => {
  return (
    <Routes>
      <Route path="/:network/:id" element={<PoolDetail />} />
      <Route path="/:network/:id/deposit" element={<PoolDetailAddLiquidity />} />
      <Route path="/:network/:id/withdraw" element={<PoolDetailWithdrawLiquidity />} />
    </Routes>
  );
};

export default PoolDetailPage;
