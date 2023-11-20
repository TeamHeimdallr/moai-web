import { useTranslation } from 'react-i18next';
import tw, { css, styled } from 'twin.macro';

import { Footer } from '~/components/footer';
import { Gnb } from '~/components/gnb';

import { usePopup } from '~/hooks/components';
import { POPUP_ID } from '~/types';

import { SwapInputGroup } from './components/swap-input-group';

const SwapPage = () => {
  const { t } = useTranslation();
  const { opened: bannerOpened } = usePopup(POPUP_ID.WALLET_ALERT);

  return (
    <>
      <Wrapper>
        <GnbWrapper banner={!!bannerOpened}>
          <Gnb />
        </GnbWrapper>
        <InnerWrapper banner={!!bannerOpened}>
          <ContentWrapper>
            <Title>{t('Swap')}</Title>

            <SwapWrapper>
              <SwapInputGroup />
            </SwapWrapper>
          </ContentWrapper>
        </InnerWrapper>
        <Footer />
      </Wrapper>
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
  banner ? tw`h-140` : tw`h-80`,
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
  font-b-24 h-40 flex items-center text-neutral-100
`;

const SwapWrapper = tw.div`
  flex gap-40 items-start
`;

export default SwapPage;
