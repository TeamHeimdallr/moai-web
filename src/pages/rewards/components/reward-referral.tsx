import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import copy from 'copy-to-clipboard';
import tw from 'twin.macro';

import { useGetRewardsRefereesQuery } from '~/api/api-server/rewards/get-referees';
import { useGetRewardsReferralCodeQuery } from '~/api/api-server/rewards/get-referral-code';
import { useGetWaveQuery } from '~/api/api-server/rewards/get-waves';

import { IconCopy } from '~/assets/icons';

import { ButtonIconMedium } from '~/components/buttons';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkAbbr, getNetworkFull } from '~/utils';
import { NETWORK } from '~/types';

export const RewardReferral = () => {
  const { t } = useTranslation();

  const { network } = useParams();
  const { isFpass, selectedNetwork } = useNetwork();
  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const currentNetworkAbbr = getNetworkAbbr(currentNetwork);

  const { evm, fpass } = useConnectedWallet();
  const evmAddress = isFpass ? fpass.address : evm?.address || '';

  const { data: wave } = useGetWaveQuery(
    { params: { networkAbbr: currentNetworkAbbr } },
    {
      enabled: selectedNetwork === NETWORK.THE_ROOT_NETWORK,
      staleTime: 20 * 1000,
    }
  );
  const { currentWave } = wave || {};

  const { data: refereesData } = useGetRewardsRefereesQuery(
    {
      params: { networkAbbr: currentNetworkAbbr },
      queries: {
        wave: currentWave?.waveId || 0,
        walletAddress: evmAddress,
      },
    },
    {
      enabled:
        selectedNetwork === NETWORK.THE_ROOT_NETWORK && !!evmAddress && !!currentWave?.waveId,
      staleTime: 20 * 1000,
    }
  );

  const { referees } = refereesData || {};

  const { data: codeData } = useGetRewardsReferralCodeQuery(
    {
      params: { networkAbbr: currentNetworkAbbr },
      queries: {
        wave: currentWave?.waveId || 0,
        walletAddress: evmAddress,
      },
    },
    {
      enabled:
        selectedNetwork === NETWORK.THE_ROOT_NETWORK && !!evmAddress && !!currentWave?.waveId,
      staleTime: 20 * 1000,
    }
  );

  const { code } = codeData || {};

  return (
    <Wrapper>
      <UpperWrapper>
        <ContentWrapper>
          <Label>{t('My Referral Code')}</Label>
          <Label>{t('My Referees')}</Label>
        </ContentWrapper>
        <ContentWrapper>
          <Value>
            {code}
            <ButtonIconMedium onClick={() => copy(code || '')} icon={<IconCopy />} />
          </Value>
          <Value>{referees}</Value>
        </ContentWrapper>
      </UpperWrapper>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col gap-16 rounded-12 bg-neutral-10 px-24 py-20
  md:(px-24 py-20)
`;

const UpperWrapper = tw.div`
  flex flex-col gap-8
`;

const ContentWrapper = tw.div`
  flex gap-40
`;

const Label = tw.div`
  w-162 font-m-16 text-neutral-80
`;

const Value = tw.div`
  w-162 flex items-center gap-4 font-m-20 text-neutral-100
`;
