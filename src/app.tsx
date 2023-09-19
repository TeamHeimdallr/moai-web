import { lazy, Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import tw from 'twin.macro';

import { ToastContainer } from './components/toasts';
import { AsyncBoundary } from './hocs/hoc-error-boundary';

const Routes = lazy(() => import('./routes'));
const Web3Provider = lazy(() => import('~/hocs/hoc-web3-provider'));

const RouteWrapper = tw.main`relative w-full h-full`;
const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<></>}>
        <Web3Provider>
          <AsyncBoundary>
            <RouteWrapper>
              <Routes />
              <ToastContainer />
            </RouteWrapper>
          </AsyncBoundary>
        </Web3Provider>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
