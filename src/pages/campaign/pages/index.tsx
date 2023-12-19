import { Route, Routes } from 'react-router-dom';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

import { usePopup } from '~/hooks/components';
import { POPUP_ID } from '~/types';

import { CampaignConnectWalletPopup } from '../components/connect-wallet-popup';

import LandingPage from './landing';
import ParticipatePage from './participate';

gsap.registerPlugin(ScrollTrigger);

const CampaignPage = () => {
  const { opened: connectWalletOpened } = usePopup(POPUP_ID.CAMPAIGN_CONNECT_WALLET);
  return (
    <>
      <Routes>
        <Route path="/participate" element={<ParticipatePage />} />
        <Route path="/*" element={<LandingPage />} />
      </Routes>
      {connectWalletOpened && <CampaignConnectWalletPopup />}
    </>
  );
};

export default CampaignPage;
