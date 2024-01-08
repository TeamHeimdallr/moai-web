import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import tw from 'twin.macro';

import { useGetCampaignsQuery } from '~/api/api-server/campaign/get-campaigns';

import { Step } from './components/step';
import { StepTitle } from './components/step-title';
import { useResetStep, useStep } from './hooks/use-step';
import { LayoutStep1WalletconnectXrp } from './layouts/layout-step1-wallet-connect-xrp';
import { LayoutStep2WalletconnectEvm } from './layouts/layout-step2-wallet-connect-evm';
import { LayoutStep3Bridge } from './layouts/layout-step3-bridge';
import { LayoutStep4AddLiquidity } from './layouts/layout-step4-add-liquidity';

const ParticipatePage = () => {
  useResetStep();

  const { step } = useStep();
  const navigate = useNavigate();

  const { data: campaignData } = useGetCampaignsQuery(
    { queries: { filter: `active:eq:true:boolean` } },
    { staleTime: 5 * 60 * 1000 }
  );
  const campaigns = campaignData?.campaigns || [];
  const campaignXrplRoot = campaigns.find(item => item.name === 'campaign-xrpl-root');
  const active = campaignXrplRoot?.active;

  useEffect(() => {
    if (active === false) {
      navigate('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <Wrapper>
      <StepWrapper>
        <Step />
        <StepTitle />

        {step === 1 && <LayoutStep1WalletconnectXrp />}
        {step === 2 && <LayoutStep2WalletconnectEvm />}
        {step === 3 && <LayoutStep3Bridge />}
        {step === 4 && <LayoutStep4AddLiquidity />}
      </StepWrapper>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-full h-full flex items-start justify-center py-40
  md:(py-80)
`;
const StepWrapper = tw.div`
  w-455 flex-center flex-col gap-24
`;

export default ParticipatePage;
