import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import tw from 'twin.macro';

import { ToastContainer } from './components/toasts';
import { AsyncBoundary } from './hocs/hoc-error-boundary';

const HomePage = lazy(() => import('./pages/home'));
const PoolDetailPage = lazy(() => import('./pages/pool-detail'));
const SwapPage = lazy(() => import('./pages/swap'));
const Web3Provider = lazy(() => import('~/hocs/hoc-web3-provider'));

const RouteWrapper = tw.main`relative w-full h-full`;
const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<></>}>
        <Web3Provider>
          <AsyncBoundary>
            <RouteWrapper>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/swap" element={<SwapPage />} />
                <Route path="/pools/*" element={<PoolDetailPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <ToastContainer />
            </RouteWrapper>
          </AsyncBoundary>
        </Web3Provider>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
