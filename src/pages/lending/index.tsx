import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import { useMaintanence } from '~/hooks/utils/use-maintanence';

import { LendingBorrow } from './pages/borrow';
import { LendingDetail } from './pages/detail';
import { LendingMain } from './pages/main';
import { LendingRepay } from './pages/repay';
import { LendingSupply } from './pages/supply';
import { LendingWithdraw } from './pages/withdraw';

const LendingPage = () => {
  const { getMaintanence } = useMaintanence();

  return (
    <Routes>
      <Route
        path="/:network"
        element={getMaintanence(
          '/lending/:network',
          <Suspense fallback={<></>}>
            <LendingMain />
          </Suspense>
        )}
      />
      <Route
        path="/:network/:id"
        element={getMaintanence(
          '/lending/:network/:id',
          <Suspense fallback={<></>}>
            <LendingDetail />
          </Suspense>
        )}
      />
      <Route
        path="/:network/:id/supply"
        element={getMaintanence('/pools/:network/:id/supply', <LendingSupply />)}
      />
      <Route
        path="/:network/:id/withdraw"
        element={getMaintanence('/pools/:network/:id/withdraw', <LendingWithdraw />)}
      />
      <Route
        path="/:network/:id/borrow"
        element={getMaintanence('/pools/:network/:id/borrow', <LendingBorrow />)}
      />
      <Route
        path="/:network/:id/replay"
        element={getMaintanence('/pools/:network/:id/replay', <LendingRepay />)}
      />
    </Routes>
  );
};

export default LendingPage;
