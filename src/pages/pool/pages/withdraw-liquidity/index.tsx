import { useNavigate, useParams } from 'react-router-dom';
import tw, { css, styled } from 'twin.macro';

import { useLiquidityPoolBalance } from '~/api/api-contract/pool/get-liquidity-pool-balance';

import { IconBack } from '~/assets/icons';

import { ButtonIconLarge } from '~/components/buttons';
import { Footer } from '~/components/footer';
import { Gnb } from '~/components/gnb';

import { useRequirePrarams } from '~/hooks/utils/use-require-params';

import { WithdrawLiquidityInputGroup } from '../../components/withdraw-liquidity-input-group';

const PoolDetailWithdrawLiquidityPage = () => {
  const navigate = useNavigate();

  const { id } = useParams();

  useRequirePrarams([!!id], () => navigate(-1));

  const { pool, lpTokenBalance } = useLiquidityPoolBalance(id ?? '');
  const { lpTokenTotalSupply } = pool;

  return (
    <>
      <Wrapper>
        <GnbWrapper>
          <Gnb />
        </GnbWrapper>
        <InnerWrapper>
          <ContentWrapper>
            <Header>
              <ButtonIconLarge icon={<IconBack />} onClick={() => navigate(-1)} />
              <Title>Withdraw from pool</Title>
            </Header>

            <WithdrawWrapper>
              <WithdrawLiquidityInputGroup
                pool={pool}
                lpTokenBalance={lpTokenBalance}
                lpTokenTotalSupply={lpTokenTotalSupply}
              />
            </WithdrawWrapper>
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

const Header = tw.div`flex items-center gap-12 font-b-24 text-neutral-100`;

const InnerWrapper = tw.div`
  flex flex-col gap-40 pt-40 pb-120
`;

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

const WithdrawWrapper = tw.div`
  flex justify-center
`;

export default PoolDetailWithdrawLiquidityPage;
