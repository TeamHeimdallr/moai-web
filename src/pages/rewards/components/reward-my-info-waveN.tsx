import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import tw from 'twin.macro';

import { useGetRewardsWaveNInfoQuery } from '~/api/api-server/rewards/get-reward-info-waveN';
import { useGetWaveQuery } from '~/api/api-server/rewards/get-waves';

import { MILLION, TRILLION } from '~/constants';

import { useGAInView } from '~/hooks/analaystics/ga-in-view';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { formatNumber, getNetworkAbbr, getNetworkFull } from '~/utils';
import { NETWORK } from '~/types';

export const RewardMyInfo = () => {
  const { ref } = useGAInView({ name: 'reward-my-info' });

  const { t } = useTranslation();

  const { network } = useParams();
  const { selectedNetwork } = useNetwork();
  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const currentNetworkAbbr = getNetworkAbbr(currentNetwork);

  const { evm, fpass } = useConnectedWallet();
  const evmAddress = evm?.address || fpass?.address;

  const { data: wave } = useGetWaveQuery(
    { params: { networkAbbr: currentNetworkAbbr } },
    {
      enabled: selectedNetwork === NETWORK.THE_ROOT_NETWORK,
      staleTime: 20 * 1000,
    }
  );
  const { currentWave } = wave || {};

  const { data: waveInfo } = useGetRewardsWaveNInfoQuery(
    {
      params: { networkAbbr: currentNetworkAbbr },
      queries: { walletAddress: evmAddress, wave: currentWave?.waveId },
    },
    {
      enabled: currentNetwork === NETWORK.THE_ROOT_NETWORK && !!evmAddress && !!currentWave?.waveId,
      staleTime: 20 * 1000,
    }
  );
  const { totalPoint, lendingBorrow, lendingSupply, lpSupply, veMOAI } = waveInfo || {};

  return (
    <Wrapper ref={ref}>
      <Title>{t('My rewards')}</Title>
      <InnerWrapper>
        <InnerTitleWrapper>
          <div>{t('Total points')}</div>
          <div>{formatNumber(totalPoint, 2, 'floor', TRILLION, 2)}</div>
        </InnerTitleWrapper>
        <InnerInfoWrapper>
          <InfoCardWrapper>
            {/* TODO: 추후 받아오는 데이터를 contract로 수정 */}
            {!!veMOAI && veMOAI > 0 && (
              <InfoCard
                name={t('Wave 0')}
                value={formatNumber(veMOAI, 2, 'floor', MILLION, 2)}
                subValue={'veMOAI'}
              />
            )}
            <InfoCard
              name={t('LP Supply')}
              value={formatNumber(lpSupply, 2, 'floor', MILLION, 2)}
              subValue={t('points')}
            />
          </InfoCardWrapper>
          <InfoCardWrapper>
            <InfoCard
              name={t('reward-lending-supply')}
              value={formatNumber(lendingSupply, 2, 'floor', MILLION, 2)}
              subValue={t('points')}
            />
            <InfoCard
              name={t('reward-lending-borrow')}
              value={formatNumber(lendingBorrow, 2, 'floor', MILLION, 2)}
              subValue={t('points')}
            />
          </InfoCardWrapper>
        </InnerInfoWrapper>
      </InnerWrapper>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex gap-24 flex-col
`;

const Title = tw.div`
  font-b-20 text-neutral-100 px-20
  md:(font-b-24 px-0)
`;

const InnerWrapper = tw.div`
  flex flex-col gap-20 rounded-12 bg-neutral-10 pt-16 pb-20 px-20
  md:(gap-24 pt-20 pb-24 px-20)
`;

const InnerTitleWrapper = tw.div`
  w-full flex items-center justify-between gap-10 font-b-18 text-neutral-100
  md:(font-b-20)
`;

const InnerInfoWrapper = tw.div`
  flex flex-col w-full gap-16 min-h-140 
  md:(flex-row)
`;
const InfoCardWrapper = tw.div`
  flex w-full h-full gap-16
`;

interface InfoCardProps {
  name: string;

  value: string;
  subValue?: string;

  button?: ReactNode;
}
const InfoCard = ({ name, value, subValue, button }: InfoCardProps) => {
  return (
    <PoolInfoCardWrapper>
      <Name>{name}</Name>
      <ValueWrapper>
        <Value>{value}</Value>
        {subValue && <SubValueWrapper>{subValue}</SubValueWrapper>}
      </ValueWrapper>
      {button && button}
    </PoolInfoCardWrapper>
  );
};
const PoolInfoCardWrapper = tw.div`
  w-full flex flex-1 flex-col items-start bg-neutral-15 rounded-12
  py-20 pl-24 pr-16 gap-16
  md:()
`;

const Name = tw.div`
  flex items-center h-32 font-m-14 text-neutral-80
  md:(font-m-16)
`;

const ValueWrapper = tw.div`
  flex flex-col gap-x-4
`;

const Value = tw.div`
  font-m-18 text-neutral-100 whitespace-pre-wrap
  md:(font-m-20)
`;

const SubValueWrapper = tw.div`
  flex items-center gap-4
  font-r-14 text-neutral-80
`;
