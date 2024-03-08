import { Navigate, Route, Routes as ReactRoutes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import { IS_DEVNET, IS_LANDING, IS_LOCAL } from '~/constants';

import { ConnectWallet } from '~/components/connect-wallet';
import XummQrPopup from '~/components/popup/xumm-qr';

import { useGARouteChange } from '~/hooks/analaystics/ga-route-change';
import { useGAIdenitiy } from '~/hooks/analaystics/ga-wallet-identity';
import { usePopup } from '~/hooks/components/use-popup';
import { useConnectXrpl } from '~/hooks/contexts';
import { useMaintanence } from '~/hooks/utils/use-maintanence';
import { useXummWalletClient } from '~/hooks/wallets/use-xumm-wallet-client';
import { POPUP_ID } from '~/types';

import Campaign from './campaign';
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
            <Route path="/campaign/*" element={getMaintanence('/campaign/*', <Campaign />)} />
            {(IS_LOCAL || IS_DEVNET) && (
              <Route path="/faucet" element={getMaintanence('/faucet', <FaucetPage />)} />
            )}
            <Route path="/lending/*" element={getMaintanence('/lending/*', <LendingPage />)} />

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
