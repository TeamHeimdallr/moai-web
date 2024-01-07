import { Route, Routes } from 'react-router-dom';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

import { useGetCampaignsQuery } from '~/api/api-server/campaign/get-campaigns';

import { usePopup } from '~/hooks/components';
import { POPUP_ID } from '~/types';

import { CampaignConnectWalletPopup } from './components/connect-wallet-popup';
import LandingPage from './pages/landing';
import ParticipatePage from './pages/participate';
import { useResetStep } from './pages/participate/hooks/use-step';

gsap.registerPlugin(ScrollTrigger);

const CampaignPage = () => {
  useResetStep();

  const { opened: connectWalletOpened } = usePopup(POPUP_ID.CAMPAIGN_CONNECT_WALLET);

  const { data: campaignData } = useGetCampaignsQuery(
    { queries: { filter: `active:eq:true:boolean` } },
    { staleTime: 5 * 60 * 1000 }
  );
  const campaigns = campaignData?.campaigns || [];
  const campaignXrplRoot = campaigns.find(item => item.name === 'campaign-xrpl-root');
  const active = campaignXrplRoot?.active;

  return (
    <>
      <Routes>
        {active && <Route path="/participate" element={<ParticipatePage />} />}
        <Route path="/*" element={<LandingPage />} />
      </Routes>
      {connectWalletOpened && <CampaignConnectWalletPopup />}
    </>
  );
};

export default CampaignPage;
