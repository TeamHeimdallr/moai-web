import { useParams } from 'react-router-dom';
import tw from 'twin.macro';
import { useAccount } from 'wagmi';

import { usePoolBalance, usePoolTotalLpTokens } from '~/api/api-contract/pool-balance';
import { POOL_ID, TOKEN_ADDRESS } from '~/constants';
import { useTokenBalances } from '~/hooks/data/use-balance';
import { getPoolInfoById } from '~/utils/token';

import { PoolCompositions } from '../../components/pool-compositions';
import { PoolInfo } from '../../components/pool-info';

export const MainLeft = () => {
  const { id } = useParams();
  const { address } = useAccount();

  const tokenAddress = id === POOL_ID.POOL_A ? TOKEN_ADDRESS.POOL_A : TOKEN_ADDRESS.POOL_B;

  const { value: lpTokenBalance } = useTokenBalances(address, tokenAddress);
  const { data: poolBalance } = usePoolBalance(id);
  const { data: totalLpTokenBalance } = usePoolTotalLpTokens(id);

  const { totalBalances, volume, apy, fees, pool } = getPoolInfoById({
    id: id ?? '',
    lpTokenBalance,
    totalLpTokenBalance,
    poolBalance,
  });

  return (
    <Wrapper>
      <PoolInfo totalBalances={totalBalances} volume={volume} apy={apy} fees={fees} />
      <PoolCompositions pool={pool} />
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-full flex flex-col gap-80
`;
