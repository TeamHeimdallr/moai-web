import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import tw from 'twin.macro';

import { useGetRewardsWave0InfoQuery } from '~/api/api-server/rewards/get-reward-info-wave0';

import { THOUSAND, TRILLION } from '~/constants';

import { useGAInView } from '~/hooks/analaystics/ga-in-view';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useMediaQuery } from '~/hooks/utils';
import { useConnectedWallet } from '~/hooks/wallets';
import { DATE_FORMATTER, formatNumber, getNetworkAbbr, getNetworkFull } from '~/utils';
import { NETWORK } from '~/types';

export const RewardInfo = () => {
  const { ref } = useGAInView({ name: 'reward-info' });
  const { ref: refMy } = useGAInView({ name: 'reward-my-info' });

  const { t } = useTranslation();
  const { isMD } = useMediaQuery();

  const { network } = useParams();
  const { selectedNetwork } = useNetwork();
  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const currentNetworkAbbr = getNetworkAbbr(currentNetwork);

  const { currentAddress } = useConnectedWallet(currentNetwork);
  const { data: waveInfo } = useGetRewardsWave0InfoQuery(
    {
      params: { networkAbbr: currentNetworkAbbr },
      queries: { walletAddress: currentAddress },
    },
    {
      enabled: currentNetwork === NETWORK.THE_ROOT_NETWORK,
      staleTime: 20 * 1000,
    }
  );
  const { endsAt, myVolume, totalReward } = waveInfo || {};

  const formattedEndsAt = endsAt ? `${format(new Date(endsAt), DATE_FORMATTER.MMM_d_yyyy)}` : '';
  const formattedEndsAtTime = endsAt ? `${format(new Date(endsAt), DATE_FORMATTER.HH_A_0)}` : '';
  const formattedTotalReward = totalReward
    ? `${formatNumber(totalReward, 2, 'floor', TRILLION, 2)}`
    : '0';

  const formattedMyVolume = myVolume ? `$${formatNumber(myVolume, 4, 'floor', THOUSAND, 0)}` : '$0';

  return (
    <Wrapper ref={ref}>
      {isMD ? (
        <InnerWrapper>
          <InfoCard name={t('Ends at')} value={formattedEndsAt} subValue={formattedEndsAtTime} />
          <InfoCard name={t('Total Reward')} value={formattedTotalReward} subValue="veMOAI" />
          {currentAddress && <InfoCard name={t('My Volume')} value={formattedMyVolume} />}
        </InnerWrapper>
      ) : (
        <>
          <InnerWrapper>
            <InfoCard name={t('Ends at')} value={formattedEndsAt} subValue={formattedEndsAtTime} />
            <InfoCard name={t('Total Reward')} value={formattedTotalReward} subValue="veMOAI" />
          </InnerWrapper>
          {currentAddress && (
            <InnerWrapper ref={refMy}>
              <InfoCard name={t('My Volume')} value={formattedMyVolume} />
            </InnerWrapper>
          )}
        </>
      )}
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex gap-16 flex-col
  md:(flex-row)
`;
const InnerWrapper = tw.div`
  flex flex-1 gap-16 min-h-126
  md:(min-h-140)
`;

interface InfoCardProps {
  name: string;

  value: string;
  subValue?: string;
}
const InfoCard = ({ name, value, subValue }: InfoCardProps) => {
  return (
    <PoolInfoCardWrapper>
      <Name>{name}</Name>
      <ValueWrapper>
        <Value>{value}</Value>
        {subValue && <SubValueWrapper>{subValue}</SubValueWrapper>}
      </ValueWrapper>
    </PoolInfoCardWrapper>
  );
};
const PoolInfoCardWrapper = tw.div`
  w-full flex flex-1 flex-col items-start bg-neutral-10 rounded-12
  py-16 pl-20 pr-12 gap-12
  md:(py-20 px-24 gap-16)
`;

const Name = tw.div`
  flex items-center h-32 font-m-14 text-neutral-80
  md:(font-m-16)
`;

const ValueWrapper = tw.div`
  flex flex-col gap-x-4 gap-2
`;

const Value = tw.div`
  font-m-18 text-neutral-100 whitespace-pre-wrap
  md:(font-m-20)
`;

const SubValueWrapper = tw.div`
  flex items-center gap-4
  font-r-14 text-neutral-80
`;
