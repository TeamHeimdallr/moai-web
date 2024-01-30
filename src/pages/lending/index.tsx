import { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { useForceNetwork, useNetwork } from '~/hooks/contexts/use-network';
import { usePrevious } from '~/hooks/utils';
import { useMaintanence } from '~/hooks/utils/use-maintanence';
import { NETWORK } from '~/types';

import { LendingBorrow } from './pages/borrow';
import { LendingDetail } from './pages/detail';
import { LendingMain } from './pages/main';
import { LendingRepay } from './pages/repay';
import { LendingSupply } from './pages/supply';
import { LendingWithdraw } from './pages/withdraw';

const LendingPage = () => {
  const { getMaintanence } = useMaintanence();
  const { selectedNetwork } = useNetwork();
  const previousNetwork = usePrevious<NETWORK>(selectedNetwork);

  useForceNetwork({
    targetNetwork: [NETWORK.THE_ROOT_NETWORK, NETWORK.EVM_SIDECHAIN],
    changeTargetNetwork: previousNetwork || selectedNetwork,
    callCallbackUnmounted: true,
  });

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
        path="/:id"
        element={getMaintanence(
          '/lending/:id',
          <Suspense fallback={<></>}>
            <LendingDetail />
          </Suspense>
        )}
      />
      <Route path="/:id/supply" element={getMaintanence('/pools/:id/supply', <LendingSupply />)} />
      <Route
        path="/:id/withdraw"
        element={getMaintanence('/pools/:id/withdraw', <LendingWithdraw />)}
      />
      <Route path="/:id/borrow" element={getMaintanence('/pools/:id/borrow', <LendingBorrow />)} />
      <Route path="/:id/replay" element={getMaintanence('/pools/:id/replay', <LendingRepay />)} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default LendingPage;
