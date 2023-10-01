import tw, { css, styled } from 'twin.macro';

import { Footer } from '~/components/footer';

import { CHAIN_ID } from '~/moai-xrp-evm/constants';

import { SwitchNetwork } from '~/moai-xrp-evm/components/banner/switch-network';
import { Gnb } from '~/moai-xrp-evm/components/gnb';

import { useSwitchNetwork } from '~/moai-xrp-evm/hooks/pages/use-switch-network';

import { Balances } from './layouts/balances-group';
import { SwapInputs } from './layouts/swap-input-group';

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