import { CHAIN } from '~/constants';

import { liquidityPools } from '~/moai-xrp-evm/data/liquidity-pool-list';

import { LiquidityPoolData } from '~/moai-xrp-evm/types/components';

import { useLiquidityPoolBalance } from './get-liquidity-pool-balance';

export const useGetLiquidityPoolLists = () => {
  const pools = liquidityPools[CHAIN];
  const pool = pools?.[0] ?? {};

  const poolId = pool.id;

  // TODO: update to server api
  const { poolInfo, liquidityPoolTokenPrice, liquidityPoolTokenBalance } =
    useLiquidityPoolBalance(poolId);

  const id = poolId;
  const isNew = pool.isNew;
  const compositions = poolInfo.compositions;
  const assets = poolInfo.compositions.map(composition => composition.name);
  const poolValue = poolInfo.value;
  const volume = poolInfo.volume;
  const apr = poolInfo.apr;

  const balance = liquidityPoolTokenBalance * liquidityPoolTokenPrice;

  return [
    {
      id,
      assets,
      compositions,
      poolValue,
      volume,
      apr,
      balance,
      isNew,
    },
  ] as LiquidityPoolData[];
};
