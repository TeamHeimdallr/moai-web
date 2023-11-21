import { useNavigate, useParams } from 'react-router-dom';
import tw, { styled } from 'twin.macro';

import { Footer } from '~/components/footer';
import { Gnb } from '~/components/gnb';

import { usePopup } from '~/hooks/components';
import { useRequirePrarams } from '~/hooks/utils';
import { POPUP_ID } from '~/types';

import { PoolCompositions } from '../../components/pool-compositions';
import { PoolHeader } from '../../components/pool-header';
import { PoolInfo } from '../../components/pool-info';
import { PoolInfoChart } from '../../components/pool-info-chart';
import { PoolLiquidityProvisions } from '../../components/pool-liquidity-provisions';
import { PoolSwapHistories } from '../../components/pool-swap-histories';
import { UserPoolBalances } from '../../components/user-pool-balances';

const PoolDetailMainPage = () => {
  const navigate = useNavigate();
  const { network, id } = useParams();
  useRequirePrarams([!!id, !!network], () => navigate(-1));

  const { opened } = usePopup(POPUP_ID.WALLET_ALERT);
  return (
    <>
      <Wrapper>
        <GnbWrapper banner={!!opened}>
          <Gnb />
        </GnbWrapper>
        <InnerWrapper banner={!!opened}>
          <ContentOuterWrapper>
            <PoolHeader />
            <ContentWrapper>
              <LeftContentWrapper>
                <PoolInfo />
                <PoolCompositions />
                <PoolInfoChart />
                <PoolLiquidityProvisions />
                <PoolSwapHistories />
              </LeftContentWrapper>
              <RightContentWrapper>
                <UserPoolBalances />
              </RightContentWrapper>
            </ContentWrapper>
          </ContentOuterWrapper>
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
const InnerWrapper = styled.div<DivProps>(({ banner }) => [
  tw`  
    flex flex-col pt-120 pb-120 px-80
  `,
  banner ? tw`pt-180` : tw`pt-120`,
]);

const GnbWrapper = styled.div<DivProps>(({ banner }) => [
  tw`
    w-full absolute top-0 left-0 flex-center flex-col z-10
  `,
  banner ? tw`h-140` : tw`h-80`,
]);

const ContentOuterWrapper = tw.div`flex flex-col w-full gap-40`;

const ContentWrapper = tw.div`
  flex gap-40
`;

const LeftContentWrapper = tw.div`
  w-full flex flex-col gap-24
`;

const RightContentWrapper = tw.div`
  w-400 flex items-start
`;

export default PoolDetailMainPage;
