import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import { useMaintanence } from '~/hooks/utils/use-maintanence';

import { PoolDetailSkeleton } from './components/skeleton-detail';
import PoolDetailAddLiquidity from './pages/add-liquidity';
import AddPoolPage from './pages/add-pool';
import PoolDetail from './pages/detail';
import FeeVotingPage from './pages/fee-voting';
import PoolDetailWithdrawLiquidity from './pages/withdraw-liquidity';

const PoolDetailPage = () => {
  const { getMaintanence } = useMaintanence();

  return (
    <Routes>
      <Route
        path="/:network/add"
        element={getMaintanence('/pools/:network/add', <AddPoolPage />)}
      />

      <Route
        path="/:network/:id"
        element={getMaintanence(
          '/pools/:network/:id',
          <Suspense fallback={<PoolDetailSkeleton />}>
            <PoolDetail />
          </Suspense>
        )}
      />
      <Route
        path="/:network/:id/fee-voting"
        element={getMaintanence('/pools/:network/:id/fee-voting', <FeeVotingPage />)}
      />
      <Route
        path="/:network/:id/deposit"
        element={getMaintanence('/pools/:network/:id/deposit', <PoolDetailAddLiquidity />)}
      />
      <Route
        path="/:network/:id/withdraw"
        element={getMaintanence('/pools/:network/:id/withdraw', <PoolDetailWithdrawLiquidity />)}
      />
    </Routes>
  );
};

export default PoolDetailPage;
