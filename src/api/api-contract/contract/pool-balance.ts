import { useMemo } from 'react';
import { useContractRead } from 'wagmi';

import { LIQUIDITY_POOL_ABI } from '~/abi/pool-contract';
import { CONTRACT_ADDRESS } from '~/constants';
import { getPoolAddress } from '~/utils/token';

export const usePoolBalance = (id: number) => {
  const enabled = useMemo(() => !!id, [id]);
  const balancerAddress = CONTRACT_ADDRESS.BALANCER;
  const poolAddress = getPoolAddress(id);

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
