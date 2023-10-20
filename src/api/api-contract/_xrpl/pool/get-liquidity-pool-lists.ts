import { useParams } from 'react-router-dom';

import { XRP_AMM } from '~/constants';

import { getNetworkFull } from '~/utils';
import { useSelecteNetworkStore } from '~/states/data';
import { IAmm, IPoolList } from '~/types';

import { useLiquidityPoolBalance } from './get-liquidity-pool-balance';

export const useGetLiquidityPoolLists = () => {
  const { network } = useParams();
  const { selectedNetwork } = useSelecteNetworkStore();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;

  const amm = XRP_AMM?.[0] ?? ({} as IAmm);

  // TODO: update to server api
  const { pool, lpTokenPrice, lpTokenBalance } = useLiquidityPoolBalance({ id: amm.id });

  const isNew = false;
  const id = pool?.id ?? '';
  const compositions = pool?.compositions ?? [];
  const assets = pool?.compositions?.map(composition => composition.symbol) ?? [];
  const poolValue = pool?.value ?? 0;
  const volume = pool?.volume ?? 0;
  const apr = pool?.apr ?? 0;

  const balance = (lpTokenBalance ?? 0) * (lpTokenPrice ?? 0);

  return [
    {
      id,
      network: currentNetwork,

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
