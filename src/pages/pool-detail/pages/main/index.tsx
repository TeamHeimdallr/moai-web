import { useNavigate, useParams } from 'react-router-dom';
import tw, { css, styled } from 'twin.macro';
import { useAccount } from 'wagmi';

import {
  usePoolBalance,
  usePoolTotalLpTokens,
} from '~/api/api-contract/pool/get-liquidity-pool-balance';
import { SwitchNetwork } from '~/components/banner/switch-network';
import { Footer } from '~/components/footer';
import { Gnb } from '~/components/gnb';
import { CHAIN_ID, POOL_ID, TOKEN_ADDRESS } from '~/constants';
import { useTokenBalances } from '~/hooks/data/use-balance';
import { useRequirePrarams } from '~/hooks/pages/use-require-params';
import { useSwitchNetwork } from '~/hooks/pages/use-switch-network';
import { getPoolMyInfoById } from '~/utils/token';

import { MainHeader } from '../../layouts/main-header';
import { MainLeft } from '../../layouts/main-left';
import { MainRight } from '../../layouts/main-right';

const PoolDetailMainPage = () => {
  const navigate = useNavigate();
  const { needSwitchNetwork } = useSwitchNetwork(CHAIN_ID);
  const { id } = useParams();
  const { address } = useAccount();
  const tokenAddress = id === POOL_ID.POOL_A ? TOKEN_ADDRESS.POOL_A : TOKEN_ADDRESS.POOL_B;

  useRequirePrarams([id], () => navigate(-1));
  const { poolInfo, compositions } = usePoolBalance(id);

  const { value: lpTokenBalance } = useTokenBalances(address, tokenAddress);
  const { data: totalLpTokenBalance } = usePoolTotalLpTokens(id);
  const { myCompositions } = getPoolMyInfoById({
    id: id ?? '',
    lpTokenBalance,
    totalLpTokenBalance,
    compositions,
  });

  return (
    <>
      {needSwitchNetwork && <SwitchNetwork />}
      <Wrapper>
        <GnbWrapper>
          <Gnb />
        </GnbWrapper>
        <InnerWrapper>
          <ContentOuterWrapper>
            <MainHeader pool={poolInfo} />
            <ContentWrapper>
              <MainLeft pool={poolInfo} />
              <MainRight pool={poolInfo} compositions={myCompositions} />
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
const InnerWrapper = tw.div`
  flex flex-col pt-120 pb-120
`;
const GnbWrapper = tw.div`
  w-full h-80 absolute top-0 left-0 flex-center z-10
`;

const ContentOuterWrapper = styled.div(() => [
  tw`flex flex-col items-center gap-40`,
  css`
    & > div {
      width: 100%;
      max-width: 1248px;
    }
  `,
]);

const ContentWrapper = tw.div`
  flex gap-40
`;

export default PoolDetailMainPage;
