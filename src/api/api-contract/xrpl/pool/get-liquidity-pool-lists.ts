import { XRP_AMM } from '~/constants';

import { useSelecteNetworkStore } from '~/states/data';
import { IAmm, IPoolList } from '~/types';

import { useLiquidityPoolBalance } from './get-liquidity-pool-balance';

export const useGetLiquidityPoolLists = () => {
  const { selectedNetwork } = useSelecteNetworkStore();

  const amm = XRP_AMM?.[0] ?? ({} as IAmm);

  // TODO: update to server api
  const { pool, liquidityPoolTokenPrice, liquidityPoolTokenBalance } = useLiquidityPoolBalance(
    amm.id
  );

  const isNew = false;
  const id = pool.id;
  const compositions = pool.compositions;
  const assets = pool.compositions.map(composition => composition.symbol);
  const poolValue = pool.value;
  const volume = pool.volume;
  const apr = pool.apr;

  const balance = liquidityPoolTokenBalance * liquidityPoolTokenPrice;

  return [
    {
      id,
      network: selectedNetwork,

      assets,
      compositions,

      poolValue,
      volume,
      apr,
      balance,

      isNew,
    },
  ] as IPoolList[];
};
