import { Abi, Address, formatEther } from 'viem';
import { useContractRead } from 'wagmi';

import { useGetPoolQuery } from '~/api/api-server/pools/get-pool';

import { STABLE_POOL_IDS } from '~/constants';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { NETWORK } from '~/types';

import { BALANCER_LP_ABI } from '~/abi';
import { COMPOSABLE_STABLE_POOL_ABI } from '~/abi/composable-stable-pool';

interface Props {
  network: NETWORK;
  poolId: string;
}
export const useLpTokenTotalSupply = ({ network, poolId }: Props) => {
  const { selectedNetwork, isEvm } = useNetwork();

  const currentNetwork = network ?? selectedNetwork;
  const chainId = useNetworkId(currentNetwork);

  const queryEnabled = !!network && !!poolId;
  const { data: poolData } = useGetPoolQuery(
    {
      params: {
        networkAbbr: network as string,
        poolId: poolId,
      },
    },
    {
      enabled: queryEnabled,
      staleTime: 1000,
    }
  );

  const { pool } = poolData || {};
  const { address: poolAddress, lpToken } = pool || {};

  const isStable = STABLE_POOL_IDS?.[currentNetwork]?.includes(poolId);

  const { data: lpTokenTotalSupplyDataNormal } = useContractRead({
    address: poolAddress as Address,
    abi: BALANCER_LP_ABI as Abi,
    functionName: 'totalSupply',
    chainId,

    staleTime: 1000 * 3,
    enabled: !!poolAddress && !!chainId && isEvm && !isStable,
  });
  const { data: lpTokenTotalSupplyDataStable } = useContractRead({
    address: poolAddress as Address,
    abi: COMPOSABLE_STABLE_POOL_ABI as Abi,
    functionName: 'getActualSupply',
    chainId,

    staleTime: 1000 * 3,
    enabled: !!poolAddress && !!chainId && isEvm && isStable,
  });
  const lpTokenTotalSupplyData = isStable
    ? lpTokenTotalSupplyDataStable
    : lpTokenTotalSupplyDataNormal;

  const lpTokenTotalSupply = Number(formatEther(lpTokenTotalSupplyData as bigint));
  const lpTokenPrice = Number(pool?.value || 0 / lpTokenTotalSupply);

  return {
    lpToken,
    lpTokenPrice,
    lpTokenTotalSupply,
  };
};
