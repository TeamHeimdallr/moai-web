import { useParams } from 'react-router-dom';
import { Abi, Address, formatEther, formatUnits, parseEther } from 'viem';
import { useContractRead } from 'wagmi';

import { useGetPoolQuery } from '~/api/api-server/pools/get-pool';

import { STABLE_POOL_IDS } from '~/constants';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import {
  calcBptOutAmountAndPriceImpact,
  calcBptOutAmountAndPriceImpactStable,
  getNetworkFull,
} from '~/utils';
import { ITokenComposition, NETWORK } from '~/types';

import { BALANCER_LP_ABI } from '~/abi';

import { useGetActualSupplyStable } from './get-actual-supply-stable';

interface Props {
  tokensInBigint?: (ITokenComposition & { amount: bigint })[]; // TODO: required
  amountsIn: number[];
  txHash?: string;
}

export const useCalculateAddLiquidity = ({ tokensInBigint, amountsIn }: Props) => {
  const { network, id } = useParams();
  const { selectedNetwork, isEvm } = useNetwork();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const chainId = useNetworkId(currentNetwork);

  const queryEnabled = !!network && !!id;
  const { data: poolData } = useGetPoolQuery(
    {
      params: {
        networkAbbr: network as string,
        poolId: id as string,
      },
    },
    {
      enabled: queryEnabled,
      staleTime: 1000,
    }
  );
  const { pool } = poolData ?? {};
  const { address: poolAddress, compositions, tradingFee } = pool || {};

  const { data: lpTokenTotalSupplyData } = useContractRead({
    address: poolAddress as Address,
    abi: BALANCER_LP_ABI as Abi,
    functionName: 'totalSupply',
    chainId,

    staleTime: 1000,
    enabled: !!poolAddress && !!chainId && isEvm,
  });
  const lpTokenTotalSupply = Number(formatEther((lpTokenTotalSupplyData as bigint) || 0n));
  const isStable = STABLE_POOL_IDS[NETWORK.THE_ROOT_NETWORK].includes((id || '') as string);

  const { actualSupply } = useGetActualSupplyStable({
    poolAddress: poolAddress as Address,
    enabled: !!poolAddress && !!chainId && isStable,
  });

  if (!isEvm)
    return {
      bptOut: 0,
      priceImpact: 0,
    };

  const { bptOut, priceImpact } = calcBptOutAmountAndPriceImpact({
    balances: compositions?.map(c => c.balance || 0) || [],
    normalizedWeights: compositions?.map(c => c.currentWeight || 0) || [],
    amountsIn,
    bptTotalSupply: lpTokenTotalSupply,
    swapFeePercentage: tradingFee || 0,
  });

  // * @param amp Amplification parameter in EVM Scale
  // * @param balances Token balances in EVM Scale normalised to 18 decimals (Should not have value for BPT token)
  // * @param amountsIn Token amounts in EVM Scale normalised to 18 decimals (Should not have value for BPT token)
  // * @param bptTotalSupply BPT total supply in EVM Scale
  // * @param swapFeePercentage Swap fee percentage in EVM Scale
  // * @returns BPT out in EVM Scale
  const sortedNormalizedBalances =
    (compositions?.sort((a, b) => a.address.localeCompare(b.address)) || [])?.map(
      c => parseEther((c.balance || 0).toFixed(18)) || 0n
    ) || [];
  const sortedNormalizedAmountsIn =
    (tokensInBigint?.sort((a, b) => a.address.localeCompare(b.address)) || [])?.map(
      t => parseEther(formatUnits(t.amount, t.decimal || 18)) || 0n
    ) || [];

  // https://github.com/balancer/balancer-sor/blob/master/src/pools/composableStable/composableStablePool.ts
  const { bptOut: bptOutStable, priceImpact: priceImpactStable } =
    calcBptOutAmountAndPriceImpactStable({
      amp: parseEther('1000'), // TODO: 1000 hardcoded for USDT-USDC pool
      balances: sortedNormalizedBalances,
      amountsIn: sortedNormalizedAmountsIn,
      bptTotalSupply: (actualSupply || 1n) as bigint,
      swapFeePercentage: parseEther((tradingFee || 0).toFixed(18)) || 0n,
    });

  return {
    bptOut: isStable ? bptOutStable : bptOut,
    priceImpact: isStable ? priceImpactStable : priceImpact,
  };
};
