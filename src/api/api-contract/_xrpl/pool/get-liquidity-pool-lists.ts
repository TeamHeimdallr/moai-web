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
  const id = pool?.id ?? '';
  const compositions = pool?.compositions ?? [];
  const assets = pool?.compositions?.map(composition => composition.symbol) ?? [];
  const poolValue = pool?.value ?? 0;
  const volume = pool?.volume ?? 0;
  const apr = pool?.apr ?? 0;

  const balance = (liquidityPoolTokenBalance ?? 0) * (liquidityPoolTokenPrice ?? 0);

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
