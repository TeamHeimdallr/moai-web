import { Abi, Address, formatEther } from 'viem';
import { useContractRead } from 'wagmi';

import { useGetPoolQuery } from '~/api/api-server/pools/get-pool';

import { POOL_ID } from '~/constants';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { calcBptOutAmountAndPriceImpact, getNetworkAbbr } from '~/utils';
import { NETWORK } from '~/types';

import { BALANCER_LP_ABI } from '~/abi';

interface Props {
  xrpAmount: number;
}

export const useCalculateAddLiquidity = ({ xrpAmount }: Props) => {
  const { selectedNetwork, isEvm } = useNetwork();

  const isRoot = selectedNetwork === NETWORK.THE_ROOT_NETWORK;
  const chainId = useNetworkId(selectedNetwork);
  const networkAbbr = getNetworkAbbr(selectedNetwork);

  const poolId = POOL_ID?.[selectedNetwork]?.ROOT_XRP;
  const { data: poolData } = useGetPoolQuery(
    {
      params: { networkAbbr, poolId },
    },
    {
      enabled: xrpAmount > 0 && isEvm && isRoot && !!poolId,
      staleTime: 1000,
    }
  );
  const { pool } = poolData ?? {};
  const { address: poolAddress, compositions, tradingFee } = pool || {};

  const poolRootAmount =
    compositions?.find(c => c.address === '0xcCcCCccC00000001000000000000000000000000')?.balance ||
    0;
  const poolXrpAmount =
    compositions?.find(c => c.address === '0xCCCCcCCc00000002000000000000000000000000')?.balance ||
    0;
  const { data: lpTokenTotalSupplyData } = useContractRead({
    address: poolAddress as Address,
    abi: BALANCER_LP_ABI as Abi,
    functionName: 'totalSupply',
    chainId,

    staleTime: 1000,
    enabled: !!poolAddress && !!chainId && isEvm && isRoot,
  });
  const lpTokenTotalSupply = Number(formatEther((lpTokenTotalSupplyData as bigint) || 0n));
  const pairedRoot = poolXrpAmount ? xrpAmount * (poolRootAmount / poolXrpAmount) : 0;

  if (!isEvm)
    return {
      bptOut: 0,
      priceImpact: 0,
    };

  const { bptOut, priceImpact } = calcBptOutAmountAndPriceImpact({
    balances: compositions?.map(c => c.balance || 0) || [],
    normalizedWeights: compositions?.map(c => c.currentWeight || 0) || [],
    amountsIn: [pairedRoot, xrpAmount],
    bptTotalSupply: lpTokenTotalSupply,
    swapFeePercentage: tradingFee || 0,
  });

  return {
    bptOut: bptOut,
    priceImpact,
  };
};
