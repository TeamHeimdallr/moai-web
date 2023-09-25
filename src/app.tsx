import { lazy, Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import tw from 'twin.macro';

import { ToastContainer } from './components/toasts';
import { AsyncBoundary } from './hocs/hoc-error-boundary';
import { CHAIN } from './constants';

const Web3Provider = lazy(() => import('~/hocs/hoc-web3-provider'));

const MoaiEVM = lazy(() => import('./moai-evm'));
const MoaiXRPRoot = lazy(() => import('./moai-xrp-root'));

const RouteWrapper = tw.main`relative w-full h-full`;
const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<></>}>
        <Web3Provider>
          <AsyncBoundary>
            <RouteWrapper>
              {(CHAIN === 'mantle' || CHAIN === 'linea') && <MoaiEVM />}
              {CHAIN === 'root' && <MoaiXRPRoot />}
              <ToastContainer />
            </RouteWrapper>
          </AsyncBoundary>
        </Web3Provider>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
