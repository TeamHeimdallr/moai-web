import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import tw from 'twin.macro';

import { useGetRewardsInfoQuery } from '~/api/api-server/rewards/get-reward-info';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { DATE_FORMATTER, formatNumber, getNetworkAbbr, getNetworkFull } from '~/utils';
import { NETWORK } from '~/types';

export const RewardInfo = () => {
  const { t } = useTranslation();

  const { network } = useParams();
  const { selectedNetwork } = useNetwork();
  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const currentNetworkAbbr = getNetworkAbbr(currentNetwork);

  const { currentAddress } = useConnectedWallet(currentNetwork);
  const { data: waveInfo } = useGetRewardsInfoQuery(
    {
      params: {
        networkAbbr: currentNetworkAbbr,
      },
      queries: {
        walletAddress: currentAddress,
      },
    },
    {
      enabled: currentNetwork === NETWORK.THE_ROOT_NETWORK,
      staleTime: 20 * 1000,
    }
  );
  const { endsAt, myReward, myVolume, totalReward } = waveInfo || {};

  const formattedEndsAt = endsAt ? `${format(new Date(endsAt), DATE_FORMATTER.MMM_d_yyyy)}` : '';
  const formattedEndsAtTime = endsAt ? `${format(new Date(endsAt), DATE_FORMATTER.HH_A_0)}` : '';
  const formattedTotalReward = totalReward
    ? `${formatNumber(totalReward, 4, 'floor', 10 ** 8)}`
    : '0';

  const formattedMyVolume = myVolume ? `$${formatNumber(myVolume, 4)}` : '$0';
  const formattedMyReward = myReward ? `${formatNumber(myReward, 4, 'floor', 10 ** 8)}` : '0';

  return (
    <Wrapper>
      <InnerWrapper>
        <InfoCard name={t('Ends at')} value={formattedEndsAt} subValue={formattedEndsAtTime} />
        <InfoCard name={t('Total Reward')} value={formattedTotalReward} subValue="veMOI" />
      </InnerWrapper>
      {currentAddress && (
        <InnerWrapper>
          <InfoCard name={t('My Volume')} value={formattedMyVolume} />
          <InfoCard name={t('My Reward')} value={formattedMyReward} subValue="veMOI" />
        </InnerWrapper>
      )}
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex gap-16 flex-col
  md:(flex-row)
`;
const InnerWrapper = tw.div`
  flex flex-1 gap-16
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
  py-16 px-20 gap-12
  md:(py-20 px-24 gap-16)
`;

const Name = tw.div`
  font-m-14 text-neutral-80
  md:(font-m-16)
`;

const ValueWrapper = tw.div`
  flex flex-wrap gap-x-4 items-end
`;

const Value = tw.div`
  font-m-18 text-neutral-100 whitespace-pre-wrap
  md:(font-m-20)
`;

const SubValueWrapper = tw.div`
  flex items-center gap-4
  font-r-14 text-neutral-80
`;
