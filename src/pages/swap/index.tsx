import tw, { css, styled } from 'twin.macro';

import { SwitchNetwork } from '~/components/banner/switch-network';
import { Footer } from '~/components/footer';
import { Gnb } from '~/components/gnb';
import { MANTLE_CHAIN_ID } from '~/constants';
import { useSwitchNetwork } from '~/hooks/pages/use-switch-network';

const SwapPage = () => {
  const { needSwitchNetwork } = useSwitchNetwork(MANTLE_CHAIN_ID);

  return (
    <>
      {needSwitchNetwork && <SwitchNetwork />}
      <Wrapper>
        <GnbWrapper>
          <Gnb />
        </GnbWrapper>
        <InnerWrapper>
          <ContentWrapper></ContentWrapper>
        </InnerWrapper>
        <Footer />
      </Wrapper>
    </>
  );
};

const Wrapper = tw.div`
  relative flex flex-col justify-between w-full h-full
`;
const InnerWrapper = tw.div`
  flex flex-col gap-40 pb-120
`;

const GnbWrapper = tw.div`
  w-full h-80 absolute top-0 left-0 flex-center z-10
`;

const ContentWrapper = styled.div(() => [
  tw`flex flex-col items-center gap-80`,
  css`
    & > div {
      width: 100%;
      max-width: 1440px;
    }
  `,
]);

export default SwapPage;
