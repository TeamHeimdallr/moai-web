import { useContractRead } from 'wagmi';

import { LIQUIDITY_POOL_ABI } from '~/abi/liquidity-pool';
import { TOKEN_ABI } from '~/abi/token';
import { CONTRACT_ADDRESS, POOL_ID, TOKEN_ADDRESS } from '~/constants';
import { PoolBalance } from '~/types/contracts';

export const usePoolBalance = (address?: string) => {
  const balancerAddress = CONTRACT_ADDRESS.VAULT;

  const { data, fetchStatus, status, isSuccess, isError } = useContractRead({
    address: balancerAddress,
    abi: LIQUIDITY_POOL_ABI,
    functionName: 'getPoolTokens',
    args: [address],
    enabled: !!address,
  });

  return {
    data: data as PoolBalance,
    isLoading: fetchStatus === 'fetching' && status === 'loading',
    isSuccess,
    isError,
  };
};

export const usePoolTotalLpTokens = (poolId?: string) => {
  const tokenAddress = poolId === POOL_ID.POOL_A ? TOKEN_ADDRESS.POOL_A : TOKEN_ADDRESS.POOL_B;

  const { data, fetchStatus, status, isSuccess, isError } = useContractRead({
    address: tokenAddress,
    abi: TOKEN_ABI,
    functionName: 'totalSupply',
    enabled: !!poolId,
  });

  return {
    data: data as bigint,
    isLoading: fetchStatus === 'fetching' && status === 'loading',
    isSuccess,
    isError,
  };
};
