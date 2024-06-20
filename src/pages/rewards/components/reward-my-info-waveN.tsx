import { HTMLAttributes, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import tw, { styled } from 'twin.macro';

import { useGetRewardsWaveNInfoQuery } from '~/api/api-server/rewards/get-reward-info-waveN';
import { useGetWaveQuery } from '~/api/api-server/rewards/get-waves';

import { COLOR } from '~/assets/colors';
import { IconLink, IconQuestion } from '~/assets/icons';

import { MILLION, TRILLION } from '~/constants';

import { ButtonIconMedium, ButtonIconSmall } from '~/components/buttons';
import { Tooltip } from '~/components/tooltips/base';

import { useGAInView } from '~/hooks/analaystics/ga-in-view';
import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { formatNumber, getNetworkAbbr, getNetworkFull } from '~/utils';
import { NETWORK, POPUP_ID, TOOLTIP_ID } from '~/types';

import { useRewardSelectWaveIdStore } from '../states';

import { RewardBindReferralPopup } from './reward-bind-referral-popup';
import { RewardBoundReferralPopup } from './reward-bound-referral-popup';
import { RewardReferral } from './reward-referral';

export const RewardMyInfo = () => {
  const { ref } = useGAInView({ name: 'reward-my-info' });

  const { t } = useTranslation();

  const { network } = useParams();
  const { isFpass, selectedNetwork } = useNetwork();
  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const currentNetworkAbbr = getNetworkAbbr(currentNetwork);

  const { evm, fpass } = useConnectedWallet();
  const evmAddress = isFpass ? fpass.address : evm?.address || '';

  const { selectedWaveId } = useRewardSelectWaveIdStore();
  const { opened: bindReferralOpened } = usePopup(POPUP_ID.REWARD_BIND_REFERRAL);
  const { opened: boundReferralOpened } = usePopup(POPUP_ID.REWARD_BOUND_REFERRAL);

  const { data: wave } = useGetWaveQuery(
    { params: { networkAbbr: currentNetworkAbbr } },
    {
      enabled: selectedNetwork === NETWORK.THE_ROOT_NETWORK,
      staleTime: 20 * 1000,
    }
  );
  const { waves } = wave || {};
  const currentWave = waves?.find(wave => wave.id === selectedWaveId);

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
  const { totalPoint, lendingBorrow, lendingSupply, lpSupply, referees, boost, veMOAI, referral } =
    waveInfo || {
      totalPoint: 0,
      lendingBorrow: 0,
      lendingSupply: 0,
      lpSupply: 0,
      referees: 0,
      boost: 0,
      veMOAI: 0,
    };
  const hasToken = !!veMOAI && veMOAI > 0;

  return (
    <Wrapper ref={ref}>
      <TitleWrapper>
        <Title>
          {t('My rewards')}
          <ButtonIconMedium
            onClick={() => {
              window.open(
                'https://medium.com/@moai-finance/wave-1-earn-your-moai-points-fdb6f0392a46'
              );
            }}
            icon={<IconLink fill={COLOR.NEUTRAL[60]} />}
          />
        </Title>

        <PointWrapper>
          {formatNumber(totalPoint, 2, 'floor', TRILLION, 2)}
          <BoostWrapper>
            {`${t('Boost')} ${formatNumber(boost, 1, 'floor', TRILLION, 1)}x`}
            <ButtonIconSmall
              icon={<IconQuestion fill={COLOR.NEUTRAL[60]} />}
              data-tooltip-id={TOOLTIP_ID.REWARD_BOOST_INFO}
            />
          </BoostWrapper>
        </PointWrapper>
      </TitleWrapper>
      <InnerInfoWrapper hasToken={hasToken}>
        {/* TODO: 추후 받아오는 데이터를 contract로 수정 */}
        {hasToken && (
          <InfoCard
            name={t('Wave 0')}
            value={formatNumber(veMOAI, 2, 'floor', MILLION, 2)}
            subValue={'veMOAI'}
          />
        )}
        <InfoCardWrapper full={!hasToken}>
          <InfoCard
            name={t('LP Supply')}
            value={formatNumber(lpSupply, 2, 'floor', MILLION, 2)}
            subValue={t('points')}
          />
        </InfoCardWrapper>
        <InfoCard
          name={t('reward-lending-supply')}
          value={formatNumber((lendingSupply || 0) + (lendingBorrow || 0), 2, 'floor', MILLION, 2)}
          subValue={t('points')}
        />
        <InfoCard
          name={t('reward-lending-referees')}
          value={formatNumber(referees, 2, 'floor', MILLION, 2)}
          subValue={t('points')}
        />
      </InnerInfoWrapper>
      <RewardReferral />
      <TooltipWrapper>
        <Tooltip id={TOOLTIP_ID.REWARD_BOOST_INFO} place="bottom">
          <TooltipContent>
            {t(
              boost === 1
                ? 'reward-boost-description1'
                : boost === 1.5
                ? 'reward-boost-description2'
                : 'reward-boost-description3'
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipWrapper>
      {bindReferralOpened && (
        <RewardBindReferralPopup
          walletAddress={evmAddress}
          networkAbbr={currentNetworkAbbr}
          waveId={currentWave?.waveId || 0}
        />
      )}
      {boundReferralOpened && <RewardBoundReferralPopup code={referral || ''} />}
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex gap-24 flex-col
`;

const TitleWrapper = tw.div`
  flex items-start justify-between gap-10
`;

const Title = tw.div`
  flex items-center font-b-20 text-neutral-100 px-20 gap-8 
  md:(font-b-24 px-0)
`;

const PointWrapper = tw.div`
  flex flex-col items-end font-b-24 text-neutral-100
`;
const BoostWrapper = tw.div`
  flex items-center gap-2 font-r-14 text-neutral-80
`;

interface InnerInfoWrapperProps {
  hasToken?: boolean;
}
const InnerInfoWrapper = styled.div<InnerInfoWrapperProps>(({ hasToken }) => [
  tw`grid w-full gap-16 min-h-140`,
  hasToken ? tw`grid-cols-2 md:(grid-cols-4)` : tw`grid-cols-2 md:(grid-cols-3)`,
]);

interface InfoCardWrapperProps {
  full?: boolean;
}
const InfoCardWrapper = styled.div<InfoCardWrapperProps>(({ full }) => [
  tw`w-full h-full`,
  full && tw`col-span-2 md:(col-span-1)`,
]);
interface InfoCardProps extends HTMLAttributes<HTMLDivElement> {
  name: string;

  value: string;
  subValue?: string;

  button?: ReactNode;
}
const InfoCard = ({ name, value, subValue, button, ...rest }: InfoCardProps) => {
  return (
    <PoolInfoCardWrapper {...rest}>
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
  w-full flex flex-1 flex-col items-start bg-neutral-10 rounded-12
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

const TooltipWrapper = tw.div`
  absolute
`;

const TooltipContent = tw.div`
  w-266
`;
