import { formatEther } from 'viem';

import { POOL_ID, TOKEN_USD_MAPPER } from '~/constants';
import { pools } from '~/data';
import { Composition } from '~/types/components/contracts';
import { TOKEN } from '~/types/contracts';
import { Entries } from '~/types/helpers';

import { formatNumber } from './number';

export const sumPoolValues = (object: Record<string, number>) =>
  (Object.entries(object) as Entries<Record<TOKEN, number>>).reduce<number>(
    (res, [token, value]) => {
      const tokenUSD = TOKEN_USD_MAPPER[token];
      return res + value * tokenUSD;
    },
    0
  );
export const getPoolId = (id: number) => {
  const poolAddress = [POOL_ID.POOL_A, POOL_ID.POOL_B];

  return poolAddress[id - 1];
};
export const getPoolInfoById = (id: number, data: unknown) => {
  const pool = pools[Number(id) - 1];
  const { compositions, volume, apy, fees } = pool;

  const myCompositionsInfo: Composition[] = data?.[1].map((balance: bigint, idx: number) => {
    const { name, weight } = compositions[idx];
    return {
      name,
      weight,
      balance: formatEther(balance),
      price: TOKEN_USD_MAPPER[name],
    };
  });
  const totalBalances = formatNumber(
    myCompositionsInfo?.reduce((acc: number, cur) => acc + cur.balance * cur.price, 0) ?? 0,
    2
  );
  return { myCompositionsInfo, totalBalances, volume, apy, fees, pool };
};
