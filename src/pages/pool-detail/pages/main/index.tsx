import { useNavigate, useParams } from 'react-router-dom';
import tw from 'twin.macro';
import { formatEther } from 'viem';
import { useAccount } from 'wagmi';

import { usePoolBalance, usePoolTotalLpTokens } from '~/api/api-contract/pool-balance';
import { IconLink } from '~/assets/icons';
import { ButtonIconMedium } from '~/components/buttons/icon';
import { Footer } from '~/components/footer';
import { Gnb } from '~/components/gnb';
import { Token } from '~/components/token';
import { TOKEN_ADDRESS } from '~/constants';
import { useTokenBalances } from '~/hooks/data/use-balance';
import { useRequirePrarams } from '~/hooks/pages/use-require-params';
import { getPoolInfoById } from '~/utils/token';

import { MyPoolBalance } from '../../components/my-pool-balance';
import { PoolInfo } from '../../components/poll-info';

const PoolDetailMainPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { address } = useAccount();
  const tokenAddress = Number(id) === 1 ? TOKEN_ADDRESS.POOL_A : TOKEN_ADDRESS.POOL_B;

  useRequirePrarams([id], () => navigate(-1));
  const { value: lpTokenBalance } = useTokenBalances(address, tokenAddress);
  const { data } = usePoolBalance(Number(id));
  const { data: totalLpTokenBalance } = usePoolTotalLpTokens();

  const { myCompositionsInfo, pool, totalBalances, volume, apy, fees } = getPoolInfoById(
    Number(id),
    data
  );
  const myCompositions = myCompositionsInfo?.map(composition => {
    const balance =
      (Number(composition.balance) * Number(lpTokenBalance)) /
      Number(formatEther(totalLpTokenBalance as bigint));
    return {
      ...composition,
      balance,
      value: balance * composition.price,
    };
  });

  return (
    <Wrapper>
      <GnbWrapper>
        <Gnb />
      </GnbWrapper>
      <InnerWrapper>
        <HeaderWrapper>
          <Title>Weighted Pool</Title>
          <TokenWrapper>
            {myCompositions?.map(composition => (
              <Token
                key={composition.name}
                token={composition.name}
                percentage={composition.weight}
                type="small"
              />
            ))}
            <ButtonIconMedium icon={<IconLink />} />
          </TokenWrapper>
          <Text>
            Dynamic swap fees : Currently <Fee>{` 0.3 `}</Fee>%
          </Text>
        </HeaderWrapper>

        <ContentWrapper>
          <PoolValueContainer>
            <PoolInfo name="Pool Value" value={totalBalances} />
            <PoolInfo name="Volume (24h)" value={volume} />
            <PoolInfo name="Fees (24h)" value={fees} />
            <PoolInfo name="APY" value={apy} />
          </PoolValueContainer>

          <MyPoolBalance pool={pool} compositions={myCompositions} />
        </ContentWrapper>
      </InnerWrapper>
      <Footer />
    </Wrapper>
  );
};

const Wrapper = tw.div`relative flex flex-col justify-between w-full h-full`;
const GnbWrapper = tw.div`w-full h-80 absolute top-0 left-0 flex-center`;
const InnerWrapper = tw.div`
  flex flex-col pb-120 pt-80 px-96
`;
const HeaderWrapper = tw.div`flex flex-col gap-12 gap-12 py-40`;
const Title = tw.div`font-b-28 text-neutral-100`;
const TokenWrapper = tw.div`flex gap-8 items-center`;
const Fee = tw.div`font-m-14`;
const Text = tw.div`font-r-14 text-neutral-60 inline-flex whitespace-pre`;

const ContentWrapper = tw.div`flex gap-40`;
const PoolValueContainer = tw.div`flex gap-16`;

export default PoolDetailMainPage;
