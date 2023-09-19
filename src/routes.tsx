import { lazy } from 'react';
import { Navigate, Route, Routes as ReactRoutes } from 'react-router-dom';

import { CHAIN_ID } from './constants';
import { CHAIN_EVM_SIDECHAIN } from './constants/constant-chain-evm-sidechain';
import { CHAIN_LINEA } from './constants/constant-chain-linea';
import { CHAIN_MANTLE } from './constants/constant-chain-mantle';
import { CHAIN_ROOT } from './constants/constant-chain-root';
import { CHAIN_XRPL } from './constants/constant-chain-xrpl';

const HomePage = lazy(() => import('./pages/home'));
const PoolDetailPage = lazy(() => import('./pages/pool-detail'));
const SwapPage = lazy(() => import('./pages/swap'));

const DefaultRountes = () => {
  return (
    <ReactRoutes>
      <Route path="/" element={<HomePage />} />
      <Route path="/swap" element={<SwapPage />} />
      <Route path="/pools/*" element={<PoolDetailPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </ReactRoutes>
  );
};

const Routes = () => {
  // TODO: Add routes for each chain
  if (CHAIN_ID === CHAIN_MANTLE.CHAIN_ID) return <DefaultRountes />;
  if (CHAIN_ID === CHAIN_LINEA.CHAIN_ID) return <DefaultRountes />;
  if (CHAIN_ID === CHAIN_ROOT.CHAIN_ID) return <DefaultRountes />;
  if (CHAIN_ID === CHAIN_XRPL.CHAIN_ID) return <DefaultRountes />;
  if (CHAIN_ID === CHAIN_EVM_SIDECHAIN.CHAIN_ID) return <DefaultRountes />;
  return <></>;
};

export default Routes;
