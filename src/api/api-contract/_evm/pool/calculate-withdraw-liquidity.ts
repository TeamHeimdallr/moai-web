import { useParams } from 'react-router-dom';
import { Address, formatUnits, parseEther, parseUnits } from 'viem';

import { useGetPoolQuery } from '~/api/api-server/pools/get-pool';

import { STABLE_POOL_IDS } from '~/constants';

import { useNetwork } from '~/hooks/contexts/use-network';
import {
  calcBptInTokenOutAmountAndPriceImpact,
  calcBptInTokenOutAmountAndPriceImpactStable,
  getNetworkFull,
} from '~/utils';
import { ITokenComposition, NETWORK } from '~/types';

import { useUserPoolTokenBalances } from '../balance/user-pool-token-balances';

import { useGetActualSupplyStable } from './get-actual-supply-stable';

interface WithdrawPriceImpactProp {
  bptIn: number;
}
export const useCalculateWithdrawLiquidity = ({ bptIn }: WithdrawPriceImpactProp) => {
  const { network, id } = useParams();
  const { isEvm } = useNetwork();

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
  const { compositions, address: poolAddress } = pool || {};
  const { lpTokenTotalSupply } = useUserPoolTokenBalances();

  const isStable = STABLE_POOL_IDS[
    getNetworkFull(network as string) ?? NETWORK.THE_ROOT_NETWORK
  ]?.includes((id || '') as string);

  const { actualSupply } = useGetActualSupplyStable({
    poolAddress: poolAddress as Address,
    enabled: !!poolAddress && isStable,
  });

  if (!isEvm)
    return {
      amountsOut: [0, 0],
      priceImpact: 0,
    };

  const { amountsOut: proportionalAmountsOut, priceImpact } = calcBptInTokenOutAmountAndPriceImpact(
    {
      balances: compositions?.map(c => c.balance || 0) ?? [],
      normalizedWeights: compositions?.map(c => c.currentWeight || 0) ?? [],
      bptIn,
      bptTotalSupply: lpTokenTotalSupply,
    }
  );
  const normalizedBalances =
    compositions?.map(
      c => parseUnits((c.balance || 0).toFixed(18), 18 + (c.decimal || 18)) || 0n
    ) ?? [];

  // https://github.com/balancer/balancer-sor/blob/master/src/pools/composableStable/composableStablePool.ts
  const { amountsOut: tokensOutStable, priceImpact: priceImpactStable } =
    calcBptInTokenOutAmountAndPriceImpactStable({
      amp: parseEther('1000'), // TODO: 1000 hardcoded for USDT-USDC pool
      balances: normalizedBalances,
      // balances: [91606792n * BigInt(1e18), 91606792n * BigInt(1e18)],
      bptAmountIn: parseEther(bptIn.toFixed(18)),
      bptTotalSupply: (actualSupply || 1n) as bigint,
    });

  const proportionalTokensOut = (compositions?.map((c, i) => ({
    ...c,
    amount: isStable
      ? Number(formatUnits(tokensOutStable[i] || 0n, c.decimal || 18))
      : proportionalAmountsOut[i],
  })) || []) as (ITokenComposition & { amount: number })[];

  return {
    proportionalTokensOut,
    priceImpact: isStable ? priceImpactStable : priceImpact,
  };
};
