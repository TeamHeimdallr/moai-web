import { Route, Routes } from 'react-router-dom';
import tw from 'twin.macro';

import { usePopup } from '~/hooks/components';
import { POPUP_ID } from '~/types';

import { CampaignConnectWalletPopup } from './components/connect-wallet/popup';
import LandingPage from './landing';
import StepPage from './step';
const RouteWrapper = tw.div`flex-center`;
const Campaign = () => {
  const { opened: connectWalletOpened } = usePopup(POPUP_ID.CAMPAIGN_CONNECT_WALLET);
  return (
    <RouteWrapper>
      <Routes>
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/step" element={<StepPage />} />
        <Route path="/*" element={<LandingPage />} />
      </Routes>
      {connectWalletOpened && <CampaignConnectWalletPopup />}
    </RouteWrapper>
  );
};

export default Campaign;
