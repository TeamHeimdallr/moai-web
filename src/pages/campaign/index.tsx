import { Route, Routes } from 'react-router-dom';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

import { usePopup } from '~/hooks/components';
import { useMaintanence } from '~/hooks/utils/use-maintanence';
import { POPUP_ID } from '~/types';

import { CampaignConnectWalletPopup } from './components/connect-wallet-popup';
import LandingPage from './pages/landing';
import ParticipatePage from './pages/participate';
import { Helmet } from './meta';

gsap.registerPlugin(ScrollTrigger);

const CampaignPage = () => {
  const { getMaintanence } = useMaintanence();

  const { opened: connectWalletOpened } = usePopup(POPUP_ID.CAMPAIGN_CONNECT_WALLET);

  return (
    <>
      <Helmet />
      <Routes>
        <Route
          path="/participate"
          element={getMaintanence('/campaign/participate', <ParticipatePage />)}
        />
        <Route path="*" element={getMaintanence('/campaign', <LandingPage />)} />
      </Routes>
      {connectWalletOpened && <CampaignConnectWalletPopup />}
    </>
  );
};

export default CampaignPage;
