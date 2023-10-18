import { lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import tw from 'twin.macro';

import { ConnectWallet } from './components/connect-wallet';
import { ToastContainer } from './components/toasts';
import ReactQueryProvider from './hocs/hoc-react-query-provider';
import Web3Provider from './hocs/hoc-web3-provider';
import { usePopup } from './hooks/components/use-popup';
import { useConnectXrpl } from './hooks/contexts';
import { POPUP_ID } from './types';

const Pages = lazy(() => import('./pages'));

const RouteWrapper = tw.main`relative w-full h-full min-w-1440`;
const App = () => {
  const { opened: connectWalletOpened } = usePopup(POPUP_ID.CONNECT_WALLET);
  useConnectXrpl();

  return (
    <BrowserRouter>
      <ReactQueryProvider>
        <Web3Provider>
          <RouteWrapper>
            <Routes>
              <Route path="*" element={<Pages />} />
            </Routes>

            <ToastContainer />
            {connectWalletOpened && <ConnectWallet />}
          </RouteWrapper>
        </Web3Provider>
      </ReactQueryProvider>
    </BrowserRouter>
  );
};

export default App;
