import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import tw from 'twin.macro';
import { useNetwork as useNetworkWagmi } from 'wagmi';

import { useGetCampaignsQuery } from '~/api/api-server/campaign/get-campaigns';

import { AlertBanner } from '~/components/alerts/banner';
import { ButtonPrimarySmallBlack } from '~/components/buttons';

import { useGAPage } from '~/hooks/analaystics/ga-page';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { useSwitchAndAddNetwork } from '~/hooks/wallets/use-add-network';
import { NETWORK } from '~/types';

import { theRootNetwork } from '~/configs/evm-network';

import { Step } from './components/step';
import { StepTitle } from './components/step-title';
import { useResetStep, useStep } from './hooks/use-step';
import { LayoutStep1WalletconnectXrp } from './layouts/layout-step1-wallet-connect-xrp';
import { LayoutStep2WalletconnectEvm } from './layouts/layout-step2-wallet-connect-evm';
import { LayoutStep3Bridge } from './layouts/layout-step3-bridge';
import { LayoutStep4AddLiquidity } from './layouts/layout-step4-add-liquidity';

const ParticipatePage = () => {
  useGAPage();
  useResetStep();

  const { step } = useStep();
  const navigate = useNavigate();

  const { selectedNetwork } = useNetwork();
  const { switchNetwork } = useSwitchAndAddNetwork();
  const { evm, fpass } = useConnectedWallet();
  const { chain } = useNetworkWagmi();
  const { t } = useTranslation();

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

  const chainId = chain?.id || 0;
  const evmAddress = evm?.address || fpass?.address;

  return (
    <Wrapper>
      {selectedNetwork === NETWORK.THE_ROOT_NETWORK &&
        chainId !== theRootNetwork.id &&
        !!evmAddress && (
          <BannerWrapper>
            <AlertBanner
              text={t('wallet-alert-message-switch', { network: 'The Root Network' })}
              button={
                <ButtonPrimarySmallBlack text={t('Switch network')} onClick={switchNetwork} />
              }
            />
          </BannerWrapper>
        )}
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
const BannerWrapper = tw.div`
  w-full absolute top-0 left-0 z-10
`;

export default ParticipatePage;
