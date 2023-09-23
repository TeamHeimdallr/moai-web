import { CHAIN } from '~/constants';

import { liquidityPools } from '~/moai-xrp-root/data/liquidity-pool-list';

import { LiquidityPoolData } from '~/moai-xrp-root/types/components';

import { useConnectWallet } from '~/moai-xrp-root/hooks/data/use-connect-wallet';

import { useLiquidityPoolBalance } from './get-liquidity-pool-balance';

export const useGetLiquidityPoolLists = () => {
  const { address } = useConnectWallet();

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

  if (!address) return [] as LiquidityPoolData[];
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
