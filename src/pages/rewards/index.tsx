import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { differenceInDays, format } from 'date-fns';
import tw, { styled } from 'twin.macro';

import { useGetRewardsWaveNInfoQuery } from '~/api/api-server/rewards/get-reward-info-waveN';
import { useGetWaveQuery } from '~/api/api-server/rewards/get-waves';

import { BadgeGnbNew } from '~/components/badges/new-gnb';
import { Footer } from '~/components/footer';
import { Gnb } from '~/components/gnb';
import { Tooltip } from '~/components/tooltips/base';

import { useGAPage } from '~/hooks/analaystics/ga-page';
import { usePopup } from '~/hooks/components';
import { useForceNetwork, useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkAbbr } from '~/utils';
import { useWalletConnectorTypeStore } from '~/states/contexts/wallets/connector-type';
import { NETWORK, POPUP_ID, TOOLTIP_ID } from '~/types';

import { RewardMyInfo } from './components/reward-my-info-waveN';
import { RewardsNetworkAlertPopup } from './components/reward-network-alert';
import RewardWave0 from './layouts/layout-wave0';
import RewardWaveN from './layouts/layout-waveN';
import { useRewardSelectWaveIdStore } from './states';

const RewardsPage = () => {
  useGAPage();
  useForceNetwork({
    popupId: POPUP_ID.REWARD_NETWORK_ALERT,
    targetNetwork: [NETWORK.THE_ROOT_NETWORK],
    changeTargetNetwork: NETWORK.THE_ROOT_NETWORK,
    callCallbackUnmounted: true,
  });

  const [searchParams] = useSearchParams();
  const referralFromParams = searchParams.get('referral');

  const [hoveredWaveId, setHoveredWaveId] = useState<number | null>(null);

  const { t, i18n } = useTranslation();
  const isKo = i18n.language === 'ko';

  const { isFpass, selectedNetwork } = useNetwork();
  const currentNetworkAbbr = getNetworkAbbr(selectedNetwork);

  const { open: openBindReferral } = usePopup(POPUP_ID.REWARD_BIND_REFERRAL);
  const { opened } = usePopup(POPUP_ID.REWARD_NETWORK_ALERT);
  const { opened: bannerOpened } = usePopup(POPUP_ID.WALLET_ALERT);

  const { setWalletConnectorType } = useWalletConnectorTypeStore();
  const { open: openWalletConnect } = usePopup(POPUP_ID.CONNECT_WALLET);

  const { evm, fpass } = useConnectedWallet();
  const evmAddress = isFpass ? fpass.address : evm?.address || '';
  const isConnecting = evm?.isConnecting || false;

  const { data } = useGetWaveQuery(
    { params: { networkAbbr: currentNetworkAbbr } },
    {
      enabled: selectedNetwork === NETWORK.THE_ROOT_NETWORK,
      staleTime: 20 * 1000,
    }
  );

  const { currentWave, waves: _waves } = data || {};
  const waves = _waves?.sort((a, b) => b.waveId - a.waveId);
  const legacy = !currentWave || currentWave?.waveId === 0;

  const { data: myWaveInfo } = useGetRewardsWaveNInfoQuery(
    {
      params: { networkAbbr: currentNetworkAbbr },
      queries: { walletAddress: evmAddress, wave: currentWave?.waveId },
    },
    {
      enabled:
        selectedNetwork === NETWORK.THE_ROOT_NETWORK && !!evmAddress && !!currentWave?.waveId,
      staleTime: 20 * 1000,
    }
  );
  const { referral } = myWaveInfo || {};

  const { selectWaveId, selectedWaveId } = useRewardSelectWaveIdStore();

  useEffect(() => {
    selectWaveId(currentWave?.waveId || 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWave?.waveId]);

  const { startAt: currentStartAt } = currentWave || {};
  const currentWaveStartDate = new Date(currentStartAt || new Date());

  const hoveredWave = waves?.find(w => w.waveId === hoveredWaveId);
  const { startAt, endAt } = hoveredWave || {};

  const startAtDate = new Date(startAt || new Date());
  const endAtDate = new Date(endAt || new Date());
  const formattedStartAt = isKo
    ? `${format(startAtDate, 'yyyy년 MM월 dd일 a hh시(O시)')
        .replace('AM', '오전')
        .replace('PM', '오후')}부터`
    : `From ${format(startAtDate, 'MMM d, yyyy, hh a O')}`;
  const formattedEndAt = isKo
    ? `${format(endAtDate, 'yyyy년 MM월 dd일 a hh시(O시)')
        .replace('AM', '오전')
        .replace('PM', '오후')}까지`
    : `to ${format(endAtDate, 'MMM d, yyyy, hh a O')}`;

  const showBadge = (waveId: number) => {
    if (!currentWave) return;

    const now = new Date();
    const diff = differenceInDays(now, currentWaveStartDate);

    return currentWave.waveId === waveId && diff <= 10;
  };

  useEffect(() => {
    // search params이 없거나 referral이 이미 있는 경우
    if (!referralFromParams || referral || isConnecting) return;
    if (!evmAddress) {
      setWalletConnectorType({ network: selectedNetwork });
      openWalletConnect();
      return;
    }

    openBindReferral();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referralFromParams, isConnecting, referral, evmAddress, selectedNetwork]);

  return (
    <>
      <Wrapper>
        <GnbWrapper banner={!!bannerOpened}>
          <Gnb />
        </GnbWrapper>
        <InnerWrapper banner={!!bannerOpened}>
          {selectedNetwork !== NETWORK.THE_ROOT_NETWORK && <></>}

          <ContentWrapper>
            {legacy && <Title>{t('Wave', { phase: 0 })}</Title>}
            {legacy && <RewardWave0 />}

            {!legacy && (
              <ContentInnerWrapper>
                {evmAddress && <RewardMyInfo />}

                <ContentWaveWrapper>
                  <TitleWrapper>
                    {waves?.map(({ waveId }) => (
                      <Title
                        key={waveId}
                        selected={waveId === selectedWaveId}
                        onClick={() => selectWaveId(waveId)}
                        onMouseEnter={() => setHoveredWaveId(waveId)}
                        onMouseLeave={() => setHoveredWaveId(null)}
                        data-tooltip-id={waveId >= 1 ? TOOLTIP_ID.REWARD_WAVE_INFO : undefined}
                      >
                        {t('Wave', { phase: waveId })}

                        {showBadge(waveId) && (
                          <BadgeWrapper>
                            <BadgeGnbNew />
                          </BadgeWrapper>
                        )}
                      </Title>
                    ))}
                  </TitleWrapper>
                  {selectedWaveId === 0 && <RewardWave0 />}
                  {selectedWaveId !== 0 && <RewardWaveN />}
                </ContentWaveWrapper>
              </ContentInnerWrapper>
            )}
          </ContentWrapper>
        </InnerWrapper>
        <Footer />
      </Wrapper>
      <Tooltip place="bottom" id={TOOLTIP_ID.REWARD_WAVE_INFO} hidden={!hoveredWave}>
        <TooltipContent>{`${formattedStartAt}\n${formattedEndAt}.`}</TooltipContent>
      </Tooltip>
      {opened && <RewardsNetworkAlertPopup />}
    </>
  );
};

const Wrapper = tw.div`
  relative flex flex-col justify-between w-full h-full
`;

interface DivProps {
  banner?: boolean;
}
const GnbWrapper = styled.div<DivProps>(({ banner }) => [
  tw`
    w-full absolute top-0 left-0 flex-center flex-col z-10
  `,
  banner ? tw`h-124 mlg:(h-140)` : tw`h-72 mlg:(h-80)`,
]);

const InnerWrapper = styled.div<DivProps>(({ banner }) => [
  tw`
    flex flex-col items-center gap-24 pb-120
    md:(px-20)
  `,
  banner ? tw`pt-164 mlg:(pt-180)` : tw`pt-112 mlg:(pt-120)`,
]);

const ContentWrapper = tw.div`
  flex flex-col w-full max-w-840 gap-24
`;

const ContentInnerWrapper = tw.div`
  flex flex-col gap-80
`;

const ContentWaveWrapper = tw.div`
  flex flex-col gap-8
`;

const TitleWrapper = tw.div`
  flex gap-24 px-20 overflow-x-auto pb-16
  md:(px-0)
`;
interface TitleProps {
  selected?: boolean;
}
const Title = styled.div<TitleProps>(({ selected }) => [
  tw`
    font-b-20 flex items-center text-neutral-60 clickable relative flex-shrink-0
    md:(font-b-24)
  `,
  selected && tw`text-neutral-100`,
]);

const TooltipContent = tw.div`
  w-266 whitespace-pre-wrap
`;

const BadgeWrapper = styled.div(() => [tw`absolute -top-4 -right-18`]);
export default RewardsPage;
