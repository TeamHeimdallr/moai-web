import { Route, Routes } from 'react-router-dom';

import { usePopup } from '~/hooks/components';
import { POPUP_ID } from '~/types';

import { CampaignConnectWalletPopup } from './components/connect-wallet/popup';
import StepPage from './pages/step';
import LandingPage from './landing';

const Campaign = () => {
  const { opened: connectWalletOpened } = usePopup(POPUP_ID.CAMPAIGN_CONNECT_WALLET);
  return (
    <>
      <Routes>
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/step" element={<StepPage />} />
        <Route path="/*" element={<LandingPage />} />
      </Routes>
      {connectWalletOpened && <CampaignConnectWalletPopup />}
    </>
  );
};

export default Campaign;
