import { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

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
        path="/"
        element={getMaintanence(
          '/lending',
          <Suspense fallback={<></>}>
            <LendingMain />
          </Suspense>
        )}
      />
      <Route
        path="/:network/:address"
        element={getMaintanence(
          '/lending/:network/:address',
          <Suspense fallback={<></>}>
            <LendingDetail />
          </Suspense>
        )}
      />
      <Route
        path="/:network/:address/supply"
        element={getMaintanence('/lending/:network/:address/supply', <LendingSupply />)}
      />
      <Route
        path="/:network/:address/withdraw"
        element={getMaintanence('/lending/:network/:address/withdraw', <LendingWithdraw />)}
      />
      <Route
        path="/:network/:address/borrow"
        element={getMaintanence('/lending/:network/:address/borrow', <LendingBorrow />)}
      />
      <Route
        path="/:network/:address/replay"
        element={getMaintanence('/lending/:network/:address/replay', <LendingRepay />)}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default LendingPage;
