import { useTranslation } from 'react-i18next';
import tw, { styled } from 'twin.macro';

import { useGetWaveQuery } from '~/api/api-server/rewards/get-waves';

import { Footer } from '~/components/footer';
import { Gnb } from '~/components/gnb';

import { useGAPage } from '~/hooks/analaystics/ga-page';
import { usePopup } from '~/hooks/components';
import { useForceNetwork, useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkAbbr } from '~/utils';
import { NETWORK, POPUP_ID } from '~/types';

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

  const { t } = useTranslation();

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
              <>
                {evmAddress && <RewardMyInfo />}
                <TitleWrapper>
                  {waves?.map(({ waveId }) => (
                    <Title
                      key={waveId}
                      selected={waveId === selectedWaveId}
                      onClick={() => selectWaveId(waveId)}
                    >
                      {t('Wave', { phase: waveId })}
                    </Title>
                  ))}
                </TitleWrapper>
                {selectedWaveId === 0 && <RewardWave0 />}
                {selectedWaveId !== 0 && <RewardWaveN />}
              </>
            )}
          </ContentWrapper>
        </InnerWrapper>
        <Footer />
      </Wrapper>
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

const TitleWrapper = tw.div`
  flex gap-24 px-20
  md:(px-0)
`;
interface TitleProps {
  selected?: boolean;
}
const Title = styled.div<TitleProps>(({ selected }) => [
  tw`
    font-b-20 h-40 flex items-center text-neutral-60 clickable
    md:(font-b-24)
  `,
  selected && tw`text-neutral-100`,
]);

export default RewardsPage;
