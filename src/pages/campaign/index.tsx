import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import tw from 'twin.macro';

import { usePopup } from '~/hooks/components';
import { POPUP_ID } from '~/types';

import { CampaignConnectWalletPopup } from './components/connect-wallet/popup';
import { LandingSkeleton } from './landing/skeleton/landing-skeleton';
import LandingPage from './landing';
import StepPage from './step';
const RouteWrapper = tw.div`flex-center`;
const Campaign = () => {
  const { opened: connectWalletOpened } = usePopup(POPUP_ID.CAMPAIGN_CONNECT_WALLET);
  return (
    <RouteWrapper>
      <Routes>
        <Route
          path="/landing"
          element={
            <Suspense fallback={<LandingSkeleton />}>
              <LandingPage />
            </Suspense>
          }
        />
        <Route path="/step" element={<StepPage />} />
        <Route
          path="/*"
          element={
            <Suspense fallback={<LandingSkeleton />}>
              <LandingPage />
            </Suspense>
          }
        />
      </Routes>
      {connectWalletOpened && <CampaignConnectWalletPopup />}
    </RouteWrapper>
  );
};

export default Campaign;
