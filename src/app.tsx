import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import tw from 'twin.macro';

import { ToastContainer } from './components/toasts';
import { AsyncBoundary } from './hocs/hoc-error-boundary';
import { CHAIN } from './constants';

const Web3Provider = lazy(() => import('~/hocs/hoc-web3-provider'));

const MoaiEVM = lazy(() => import('./moai-evm'));
const MoaiXRPRoot = lazy(() => import('./moai-xrp-root'));
const MoaiXRPLedger = lazy(() => import('./moai-xrp-ledger'));

const HomePage = lazy(() => import('./pages/home'));

const RouteWrapper = tw.main`relative w-full h-full min-w-1440`;
const App = () => {
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

              {CHAIN === 'mantle' && <MoaiEVM />}
              {CHAIN === 'linea' && <MoaiEVM />}
              {CHAIN === 'root' && <MoaiXRPRoot />}
              {CHAIN === 'xrpl' && <MoaiXRPLedger />}
              <ToastContainer />
            </RouteWrapper>
          </AsyncBoundary>
        </Web3Provider>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
