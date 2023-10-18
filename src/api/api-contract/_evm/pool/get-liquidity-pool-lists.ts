import { Address } from 'viem';

import { EVM_POOL } from '~/constants';

import { useNetwork } from '~/hooks/contexts/use-network';
import { IPoolList } from '~/types';

import { useLiquidityPoolBalance } from './get-liquidity-pool-balance';

export const useGetLiquidityPoolLists = () => {
  const { selectedNetwork } = useNetwork();

  const pool = EVM_POOL[selectedNetwork]?.[0] ?? { id: '', tokenName: '', tokenAddress: '' };
  const { id } = pool;

  // TODO: update to server api
  const { pool: poolInfo, lpTokenPrice, lpTokenBalance } = useLiquidityPoolBalance(id as Address);

  const isNew = false;
  const compositions = poolInfo?.compositions ?? [];
  const assets = poolInfo?.compositions?.map(composition => composition.symbol) ?? [];
  const poolValue = poolInfo?.value ?? 0;
  const volume = poolInfo?.volume ?? 0;
  const apr = poolInfo?.apr ?? 0;

  const balance = (lpTokenBalance ?? 0) * (lpTokenPrice ?? 0);

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
