import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import tw from 'twin.macro';

import { ToastContainer } from './components/toasts';
import { SelectWalletPopup } from './components/wallet-selection';
import { AsyncBoundary } from './hocs/hoc-error-boundary';
import { usePopup } from './hooks/pages/use-popup';
import { CHAIN } from './constants';
import { POPUP_ID } from './types';

const Web3Provider = lazy(() => import('~/hocs/hoc-web3-provider'));

const MoaiRoot = lazy(() => import('./moai-xrp-root'));
const MoaiXRPLedger = lazy(() => import('./moai-xrp-ledger'));
const MoaiXRPEvm = lazy(() => import('./moai-xrp-evm'));

const HomePage = lazy(() => import('./pages/home'));

const RouteWrapper = tw.main`relative w-full h-full min-w-1440`;
const App = () => {
  const { opened } = usePopup(POPUP_ID.WALLET);

  return (
    <BrowserRouter>
      <Suspense fallback={<></>}>
        <Web3Provider>
          <AsyncBoundary>
            <RouteWrapper>
              {!CHAIN && (
                <Routes>
                  <Route path="/" element={<HomePage />} />
                </Routes>
              )}

              {CHAIN === 'root' && <MoaiRoot />}
              {CHAIN === 'xrpl' && <MoaiXRPLedger />}
              {CHAIN === 'xrpevm' && <MoaiXRPEvm />}
              <ToastContainer />
              {opened && <SelectWalletPopup />}
            </RouteWrapper>
          </AsyncBoundary>
        </Web3Provider>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
