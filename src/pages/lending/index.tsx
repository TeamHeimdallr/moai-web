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
        path="/:network/:symbol"
        element={getMaintanence(
          '/lending/:network/:symbol',
          <Suspense fallback={<></>}>
            <LendingDetail />
          </Suspense>
        )}
      />
      <Route
        path="/:network/:symbol/supply"
        element={getMaintanence('/lending/:network/:symbol/supply', <LendingSupply />)}
      />
      <Route
        path="/:network/:symbol/withdraw"
        element={getMaintanence('/lending/:network/:symbol/withdraw', <LendingWithdraw />)}
      />
      <Route
        path="/:network/:symbol/borrow"
        element={getMaintanence('/lending/:network/:symbol/borrow', <LendingBorrow />)}
      />
      <Route
        path="/:network/:symbol/replay"
        element={getMaintanence('/lending/:network/:symbol/replay', <LendingRepay />)}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default LendingPage;
