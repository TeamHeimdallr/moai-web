import { useTranslation } from 'react-i18next';
import tw, { css, styled } from 'twin.macro';

import { Footer } from '~/components/footer';
import { Gnb } from '~/components/gnb';

import { useGAInView } from '~/hooks/analaystics/ga-in-view';
import { useGAPage } from '~/hooks/analaystics/ga-page';
import { usePopup } from '~/hooks/components';
import { useForceNetwork, useNetwork } from '~/hooks/contexts/use-network';
import { usePrevious } from '~/hooks/utils';
import { NETWORK, POPUP_ID } from '~/types';

import { FaucetList } from './components/faucet-list';

const FaucetPage = () => {
  useGAPage();

  const { selectedNetwork } = useNetwork();
  const previousNetwork = usePrevious<NETWORK>(selectedNetwork);

  const targetNetork = [NETWORK.XRPL, NETWORK.EVM_SIDECHAIN];
  useForceNetwork({
    targetNetwork: targetNetork,
    changeTargetNetwork: previousNetwork || targetNetork[0],
    callCallbackUnmounted: true,
  });

  const { ref } = useGAInView({ name: 'faucet' });

  const { t } = useTranslation();
  const { opened: bannerOpened } = usePopup(POPUP_ID.WALLET_ALERT);

  return (
    <Wrapper ref={ref}>
      <GnbWrapper banner={!!bannerOpened}>
        <Gnb />
      </GnbWrapper>
      <InnerWrapper banner={!!bannerOpened}>
        {targetNetork.includes(selectedNetwork) && (
          <ContentWrapper>
            <Title>{t('Faucet')}</Title>

            <FaucetWrapper>
              <FaucetList />
            </FaucetWrapper>
          </ContentWrapper>
        )}
      </InnerWrapper>
      <Footer />
    </Wrapper>
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
    flex flex-col gap-40 pb-120
  `,
  banner ? tw`pt-180` : tw`pt-120`,
]);

const ContentWrapper = styled.div(() => [
  tw`flex flex-col items-center gap-40`,
  css`
    & > div {
      width: 100%;
      max-width: 455px;
    }
  `,
]);

const Title = tw.div`
  font-b-20 h-40 flex items-center text-neutral-100 px-20
  md:(font-b-24 px-0)
`;

const FaucetWrapper = tw.div`
  flex gap-40 items-start
`;

export default FaucetPage;
