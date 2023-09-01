import tw, { css, styled } from 'twin.macro';

import { SwitchNetwork } from '~/components/banner/switch-network';
import { Footer } from '~/components/footer';
import { Gnb } from '~/components/gnb';
import { CHAIN_ID } from '~/constants';
import { useSwitchNetwork } from '~/hooks/pages/use-switch-network';

import { Balances } from './layouts/balances';
import { SwapInputs } from './layouts/swap-inputs';

const SwapPage = () => {
  const { needSwitchNetwork } = useSwitchNetwork(CHAIN_ID);

  return (
    <>
      {needSwitchNetwork && <SwitchNetwork />}
      <Wrapper>
        <GnbWrapper>
          <Gnb />
        </GnbWrapper>
        <InnerWrapper>
          <ContentWrapper>
            <Title>Swap</Title>

            <SwapWrapper>
              <Balances />
              <SwapInputs />
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

const GnbWrapper = tw.div`
  w-full h-80 flex-center
`;

const InnerWrapper = tw.div`
  flex flex-col gap-40 pt-40 pb-120
`;

const ContentWrapper = styled.div(() => [
  tw`flex flex-col items-center gap-40`,
  css`
    & > div {
      width: 100%;
      max-width: 786px;
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
