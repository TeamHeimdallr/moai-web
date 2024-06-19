import { Navigate, Route, Routes as ReactRoutes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import { IS_DEVNET, IS_LANDING, IS_LOCAL } from '~/constants';

import { ConnectWallet } from '~/components/connect-wallet';
import XummQrPopup from '~/components/popup/xumm-qr';

import { useGARouteChange } from '~/hooks/analaystics/ga-route-change';
import { useGAIdenitiy } from '~/hooks/analaystics/ga-wallet-identity';
import { usePopup } from '~/hooks/components/use-popup';
import { useConnectXrpl } from '~/hooks/contexts';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useMaintanence } from '~/hooks/utils/use-maintanence';
import { useXummWalletClient } from '~/hooks/wallets/use-xumm-wallet-client';
import { NETWORK, POPUP_ID } from '~/types';

import BridgeRootPage from './bridge';
import EventPage from './events';
import FaucetPage from './faucet';
import Home from './home';
import Landing from './landing';
import LendingPage from './lending';
import Pool from './pool';
import Rewards from './rewards';
import Swap from './swap';

const Page = () => {
  useGAIdenitiy();
  useGARouteChange();
  useConnectXrpl();

  useXummWalletClient();

  const { getMaintanence } = useMaintanence();

  const { opened: connectWalletOpened } = usePopup(POPUP_ID.CONNECT_WALLET);
  const { opened: xummQrOpened } = usePopup(POPUP_ID.XUMM_QR);

  const { selectedNetwork } = useNetwork();
  const isRoot = selectedNetwork === NETWORK.THE_ROOT_NETWORK;
  const isXrpl = selectedNetwork === NETWORK.XRPL;

  return (
    <>
      <ReactRoutes>
        {IS_LANDING && (
          <>
            <Route path="/" element={getMaintanence('/', <Landing />)} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}

        {!IS_LANDING && (
          <>
            <Route path="/" element={getMaintanence('/', <Home />)} />
            <Route path="/swap" element={getMaintanence('/swap', <Swap />)} />
            <Route path="/pools/*" element={getMaintanence('/pools/*', <Pool />)} />
            <Route path="/rewards" element={getMaintanence('/rewards', <Rewards />)} />
            {(IS_LOCAL || IS_DEVNET) && (
              <Route path="/faucet" element={getMaintanence('/faucet', <FaucetPage />)} />
            )}
            <Route path="/lending/*" element={getMaintanence('/lending/*', <LendingPage />)} />
            {(isRoot || isXrpl) && (
              <Route path="/bridge" element={getMaintanence('/bridge', <BridgeRootPage />)} />
            )}
            <Route path="/events/*" element={getMaintanence('/events', <EventPage />)} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </ReactRoutes>

      <ToastContainer />
      {connectWalletOpened && <ConnectWallet />}
      {xummQrOpened && <XummQrPopup />}
    </>
  );
};

export default Page;
