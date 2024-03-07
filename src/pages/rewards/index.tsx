import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { differenceInDays, differenceInMinutes, format } from 'date-fns';
import tw, { styled } from 'twin.macro';

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

  const { t, i18n } = useTranslation();
  const isKo = i18n.language === 'ko';

  const { isFpass, selectedNetwork } = useNetwork();
  const currentNetworkAbbr = getNetworkAbbr(selectedNetwork);

  const { opened } = usePopup(POPUP_ID.REWARD_NETWORK_ALERT);
  const { opened: bannerOpened } = usePopup(POPUP_ID.WALLET_ALERT);

  const { evm, fpass } = useConnectedWallet();
  const evmAddress = isFpass ? fpass.address : evm?.address || '';

  const { data } = useGetWaveQuery(
    { params: { networkAbbr: currentNetworkAbbr } },
    {
      enabled: selectedNetwork === NETWORK.THE_ROOT_NETWORK,
      staleTime: 20 * 1000,
    }
  );

  const { currentWave, waves } = data || {};
  const legacy = !currentWave || currentWave?.waveId === 0;

  const { selectWaveId, selectedWaveId } = useRewardSelectWaveIdStore();

  useEffect(() => {
    selectWaveId(currentWave?.waveId || 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWave?.waveId]);

  const { startAt, endAt } = currentWave || {};

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
    const diff = differenceInDays(now, startAtDate);

    return currentWave.waveId === waveId && diff <= 10;
  };

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
      <Tooltip place="bottom" id={TOOLTIP_ID.REWARD_WAVE_INFO}>
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
  flex flex-col gap-24
`;

const TitleWrapper = tw.div`
  flex gap-24 px-20
  md:(px-0)
`;
interface TitleProps {
  selected?: boolean;
}
const Title = styled.div<TitleProps>(({ selected }) => [
  tw`
    font-b-20 flex items-center text-neutral-60 clickable relative
    md:(font-b-24)
  `,
  selected && tw`text-neutral-100`,
]);

const TooltipContent = tw.div`
  w-266 whitespace-pre-wrap
`;

const BadgeWrapper = styled.div(() => [tw`absolute -top-4 -right-18`]);
export default RewardsPage;
