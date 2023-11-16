import { Route, Routes } from 'react-router-dom';

import { usePopup } from '~/hooks/components';
import { POPUP_ID } from '~/types';

import { CampaignConnectWalletPopup } from './components/connect-wallet/popup';
import LandingPage from './landing';
import StepPage from './step';

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
