import { Navigate, Route, Routes as ReactRoutes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import { ConnectWallet } from '~/components/connect-wallet';

import { usePopup } from '~/hooks/components/use-popup';
import { useConnectXrpl } from '~/hooks/contexts';
import { POPUP_ID } from '~/types';

import Home from './home';
import LandingPage from './landing';
import Pool from './pool';
import Swap from './swap';

const Page = () => {
  const { opened: connectWalletOpened } = usePopup(POPUP_ID.CONNECT_WALLET);
  useConnectXrpl();

  return (
    <>
      <ReactRoutes>
        <Route path="/" element={<Home />} />
        <Route path="/swap" element={<Swap />} />
        <Route path="/pools/*" element={<Pool />} />

        <Route path="/landing" element={<LandingPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </ReactRoutes>
      <ToastContainer />
      {connectWalletOpened && <ConnectWallet />}
    </>
  );
};

export default Page;
