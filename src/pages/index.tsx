import { Navigate, Route, Routes as ReactRoutes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import { ConnectWallet } from '~/components/connect-wallet';

import { usePopup } from '~/hooks/components/use-popup';
import { useConnectXrpl } from '~/hooks/contexts';
import { useWalletTypeStore } from '~/states/contexts/wallets/wallet-type';
import { POPUP_ID } from '~/types';

import Home from './home';
import LandingPage from './landing';
import Pool from './pool';
import Swap from './swap';

const Page = () => {
  const { opened: connectWalletOpened } = usePopup(POPUP_ID.CONNECT_WALLET);
  useConnectXrpl();
  const { evm, xrpl } = useWalletTypeStore();

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
      {connectWalletOpened && <ConnectWallet evm={evm} xrpl={xrpl} />}
    </>
  );
};

export default Page;
