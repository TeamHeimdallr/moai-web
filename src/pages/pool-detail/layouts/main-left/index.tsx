import { useParams } from 'react-router-dom';
import tw from 'twin.macro';
import { useAccount } from 'wagmi';

import { usePoolBalance, usePoolTotalLpTokens } from '~/api/api-contract/pool-balance';
import { POOL_ID, TOKEN_ADDRESS } from '~/constants';
import { useTokenBalances } from '~/hooks/data/use-balance';
import { getPoolInfoById } from '~/utils/token';

import { LiquidityProvisions } from '../../components/liquidity-provisions';
import { PoolCompositions } from '../../components/pool-compositions';
import { PoolInfo } from '../../components/pool-info';
import { Swap } from '../../components/swap';

export const MainLeft = () => {
  const { id } = useParams();
  const { address } = useAccount();

  const tokenAddress = id === POOL_ID.POOL_A ? TOKEN_ADDRESS.POOL_A : TOKEN_ADDRESS.POOL_B;

  const { value: lpTokenBalance } = useTokenBalances(address, tokenAddress);
  const { data: poolBalance } = usePoolBalance(id);
  const { data: totalLpTokenBalance } = usePoolTotalLpTokens(id);

  const { totalBalances, volume, apr, fees, pool } = getPoolInfoById({
    id: id ?? '',
    lpTokenBalance,
    totalLpTokenBalance,
    poolBalance,
  });

  return (
    <Wrapper>
      <PoolInfo totalBalances={totalBalances} volume={volume} apr={apr} fees={fees} />
      <PoolCompositions pool={pool} />
      <LiquidityProvisions pool={pool} />
      <Swap pool={pool} />
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-full flex flex-col gap-80
`;
