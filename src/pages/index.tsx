import { Navigate, Route, Routes as ReactRoutes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import { IS_LANDING } from '~/constants';

import { ConnectWallet } from '~/components/connect-wallet';
import XummQrPopup from '~/components/popup/xumm-qr';

import { usePopup } from '~/hooks/components/use-popup';
import { useConnectXrpl } from '~/hooks/contexts';
import { useXummWalletClient } from '~/hooks/wallets/use-xumm-wallet-client';
import { POPUP_ID } from '~/types';

import Campaign from './campaign';
import Home from './home';
import Landing from './landing';
import Pool from './pool';
import Rewards from './rewards';
import Swap from './swap';

const Page = () => {
  useConnectXrpl();
  useXummWalletClient();

  const { opened: connectWalletOpened } = usePopup(POPUP_ID.CONNECT_WALLET);
  const { opened: xummQrOpened } = usePopup(POPUP_ID.XUMM_QR);

  return (
    <>
      <ReactRoutes>
        {IS_LANDING && (
          <>
            <Route path="/" element={<Landing />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}

        {!IS_LANDING && (
          <>
            <Route path="/" element={<Home />} />
            <Route path="/swap" element={<Swap />} />
            <Route path="/pools/*" element={<Pool />} />
            <Route path="/rewards/*" element={<Rewards />} />
            <Route path="/campaign/*" element={<Campaign />} />

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
