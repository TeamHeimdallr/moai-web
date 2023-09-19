import { CHAIN } from '~/constants';
import { useConnectWallet } from '~/hooks/data/use-connect-wallet';
import { LiquidityPoolData } from '~/types/components';

import { liquidityPoolIds } from './data/liquidity-pool-list';
import { usePoolBalance } from './get-liquidity-pool-balance';

export const useGetLiquidityPoolLists = () => {
  const { address } = useConnectWallet();

  const poolIds = liquidityPoolIds[CHAIN];
  // TODO
  const poolId = poolIds?.[0] ?? [];

  const { poolInfo, compositions, tokenTotalSupply, liquidityPoolTokenBalance } = usePoolBalance(
    poolId.id,
    address
  );

  if (!poolId || !compositions) return [];

  const id = poolId.id;
  const assets = compositions?.map(composition => composition.name) ?? [];
  const composition =
    compositions?.reduce((acc, cur) => {
      const { weight } = cur;
      acc[cur.name] = weight;

      return acc;
    }, {}) ?? {};
  const poolValue = poolInfo?.valueRaw ?? 0;
  const volume = poolInfo?.volumeRaw ?? 0;
  const apr = poolInfo?.aprRaw ?? 0;

  const liquidityTokenPrice = tokenTotalSupply ? poolValue / tokenTotalSupply : 0;
  const balance = liquidityPoolTokenBalance * liquidityTokenPrice; // my balance

  return [
    {
      id,
      assets,
      composition,
      poolValue,
      volume,
      apr,
      balance,
    },
  ] as LiquidityPoolData[];
};

export const useGetMyLiquidityPoolLists = () => {
  return [];
};
