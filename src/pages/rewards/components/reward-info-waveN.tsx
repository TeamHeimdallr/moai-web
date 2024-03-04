import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import tw from 'twin.macro';

import { useGetRewardsWaveNInfoQuery } from '~/api/api-server/rewards/get-reward-info-waveN';

import { useGAInView } from '~/hooks/analaystics/ga-in-view';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { DATE_FORMATTER, getNetworkAbbr, getNetworkFull } from '~/utils';
import { NETWORK } from '~/types';

export const RewardInfo = () => {
  const { ref } = useGAInView({ name: 'reward-info' });

  const { t } = useTranslation();

  const { network } = useParams();
  const { selectedNetwork } = useNetwork();
  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const currentNetworkAbbr = getNetworkAbbr(currentNetwork);

  const { currentAddress } = useConnectedWallet(currentNetwork);
  const { data: waveInfo } = useGetRewardsWaveNInfoQuery(
    {
      params: { networkAbbr: currentNetworkAbbr },
      queries: { walletAddress: currentAddress },
    },
    {
      enabled: currentNetwork === NETWORK.THE_ROOT_NETWORK,
      staleTime: 20 * 1000,
    }
  );
  const { startAt, endAt } = waveInfo || {};

  const formattedStartAt = startAt ? `${format(new Date(startAt), DATE_FORMATTER.MMM_d_yyyy)}` : '';
  const formattedStartAtTime = startAt ? `${format(new Date(startAt), DATE_FORMATTER.HH_A_0)}` : '';

  const formattedEndAt = endAt ? `${format(new Date(endAt), DATE_FORMATTER.MMM_d_yyyy)}` : '';
  const formattedEndAtTime = endAt ? `${format(new Date(endAt), DATE_FORMATTER.HH_A_0)}` : '';

  return (
    <Wrapper ref={ref}>
      <InnerWrapper>
        <InfoCard name={t('Start at')} value={formattedStartAt} subValue={formattedStartAtTime} />
        <InfoCard name={t('End at')} value={formattedEndAt} subValue={formattedEndAtTime} />
      </InnerWrapper>
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
