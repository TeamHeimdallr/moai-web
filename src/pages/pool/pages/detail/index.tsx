import { useNavigate, useParams } from 'react-router-dom';
import tw, { styled } from 'twin.macro';

import { Footer } from '~/components/footer';
import { Gnb } from '~/components/gnb';

import { useGAPage } from '~/hooks/analaystics/ga-page';
import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useRequirePrarams } from '~/hooks/utils';
import { getNetworkFull } from '~/utils';
import { NETWORK, POPUP_ID } from '~/types';

import { CampaignTool } from '../../components/campaign-tool';
import { PoolCompositions } from '../../components/pool-compositions';
import { PoolHeader } from '../../components/pool-header';
import { PoolInfo } from '../../components/pool-info';
import { PoolInfoChart } from '../../components/pool-info-chart';
import { PoolLiquidityProvisions } from '../../components/pool-liquidity-provisions';
import { PoolSwapHistories } from '../../components/pool-swap-histories';
import { PotentialRisks } from '../../components/potential-risks';
import { UserPoolBalances } from '../../components/user-pool-balances';

const PoolDetailMainPage = () => {
  useGAPage();

  const navigate = useNavigate();
  const { network, id } = useParams();
  const { selectedNetwork } = useNetwork();
  useRequirePrarams([!!id, !!network], () => navigate(-1));

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const isRoot = currentNetwork === NETWORK.THE_ROOT_NETWORK;

  const { opened } = usePopup(POPUP_ID.WALLET_ALERT);
  return (
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
              <PotentialRisks />
            </LeftContentWrapper>
            <RightContentWrapper>
              <UserPoolBalances />
              {isRoot && <CampaignTool />}
            </RightContentWrapper>
          </ContentWrapper>
        </ContentOuterWrapper>
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
const InnerWrapper = styled.div<DivProps>(({ banner }) => [
  tw`  
    flex flex-col pt-120 pb-120 px-20 pt-112
    mlg:(pt-120)
    xl:(px-80 items-center)
  `,
  banner &&
    tw`
      pt-164
      md:(pt-172)
      mlg:(pt-180)
    `,
]);

const GnbWrapper = styled.div<DivProps>(({ banner }) => [
  tw`
    w-full absolute top-0 left-0 flex-center flex-col z-10
  `,
  banner ? tw`h-124 mlg:(h-140)` : tw`h-72 mlg:(h-80)`,
]);

const ContentOuterWrapper = tw.div`
  flex flex-col w-full gap-40 max-w-1440
`;

const ContentWrapper = tw.div`
  flex flex-col gap-20
  lg:(flex-row) 
  xl:(gap-40)
`;

const LeftContentWrapper = tw.div`
  flex flex-col gap-24 flex-1 min-w-0 order-2
  lg:(order-1)
`;

const RightContentWrapper = tw.div`
  w-full flex flex-col gap-24 order-1
  lg:(order-2 w-400 items-start)
`;

export default PoolDetailMainPage;
