import { Address } from 'viem';

import { EVM_POOL } from '~/constants';

import { useSelecteNetworkStore } from '~/states/data';
import { IPoolList } from '~/types';

import { useLiquidityPoolBalance } from './get-liquidity-pool-balance';

export const useGetLiquidityPoolLists = () => {
  const { selectedNetwork } = useSelecteNetworkStore();

  const pool = EVM_POOL[selectedNetwork]?.[0] ?? { id: '', tokenName: '', tokenAddress: '' };
  const { id } = pool;

  // TODO: update to server api
  const {
    pool: poolInfo,
    liquidityPoolTokenPrice,
    liquidityPoolTokenBalance,
  } = useLiquidityPoolBalance(id as Address);

  const isNew = false;
  const compositions = poolInfo.compositions;
  const assets = poolInfo.compositions.map(composition => composition.symbol);
  const poolValue = poolInfo.value;
  const volume = poolInfo.volume;
  const apr = poolInfo.apr;

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
