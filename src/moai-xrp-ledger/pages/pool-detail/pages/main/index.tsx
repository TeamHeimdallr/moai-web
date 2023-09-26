import { useNavigate, useParams } from 'react-router-dom';
import tw, { css, styled } from 'twin.macro';

import { Footer } from '~/components/footer';

import { useRequirePrarams } from '~/hooks/pages/use-require-params';

import { useLiquidityPoolBalance } from '~/moai-xrp-ledger/api/api-contract/pool/get-liquidity-pool-balance';

import { AMM } from '~/moai-xrp-ledger/constants';

import { Gnb } from '~/moai-xrp-ledger/components/gnb';
import { TokenInfo } from '~/moai-xrp-ledger/types/components';

import { MainHeader } from '../../layouts/main-header';
import { MainLeft } from '../../layouts/main-left';
import { MainRight } from '../../layouts/main-right';

const PoolDetailMainPage = () => {
  const navigate = useNavigate();
  const { id: poolId } = useParams();

  useRequirePrarams([!!poolId], () => navigate(-1));

  const { poolInfo, liquidityPoolTokenBalance } = useLiquidityPoolBalance(AMM[poolId as string]);
  const { compositions, tokenTotalSupply } = poolInfo;

  const userPoolBalances: TokenInfo[] = compositions?.map(composition => {
    const balance = tokenTotalSupply
      ? composition.balance * (liquidityPoolTokenBalance / tokenTotalSupply)
      : 0;
    const value = balance * composition.price;
    return {
      name: composition.name,
      balance,
      price: composition.price,
      value,
    };
  });

  return (
    <>
      <Wrapper>
        <GnbWrapper>
          <Gnb />
        </GnbWrapper>
        <InnerWrapper>
          <ContentOuterWrapper>
            <MainHeader pool={poolInfo} />
            <ContentWrapper>
              <MainLeft pool={poolInfo} />
              <MainRight pool={poolInfo} userPoolBalances={userPoolBalances} />
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
