import { useMemo } from 'react';
import { useContractRead } from 'wagmi';

import { LIQUIDITY_POOL_ABI } from '~/abi/pool-contract';
import { TOKEN_ABI } from '~/abi/sample-token';
import { CONTRACT_ADDRESS, TOKEN_ADDRESS } from '~/constants';
import { getPoolId } from '~/utils/token';

export const usePoolBalance = (id: number) => {
  const enabled = useMemo(() => !!id, [id]);
  const balancerAddress = CONTRACT_ADDRESS.VAULT;
  const poolAddress = getPoolId(id);

  const { data, fetchStatus, status, isSuccess, isError } = useContractRead({
    address: balancerAddress,
    abi: LIQUIDITY_POOL_ABI,
    functionName: 'getPoolTokens',
    args: [poolAddress],
    enabled,
  });

  return {
    data,
    isLoading: fetchStatus === 'fetching' && status === 'loading',
    isSuccess,
    isError,
  };
};

export const usePoolTotalLpTokens = () => {
  const tokenAddress = TOKEN_ADDRESS.POOL_A;

  const { data, fetchStatus, status, isSuccess, isError } = useContractRead({
    address: tokenAddress,
    abi: TOKEN_ABI,
    functionName: 'totalSupply',
  });

  return {
    data,
    isLoading: fetchStatus === 'fetching' && status === 'loading',
    isSuccess,
    isError,
  };
};
