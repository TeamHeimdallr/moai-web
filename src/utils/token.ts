import { formatEther } from 'viem';

import { TOKEN_USD_MAPPER } from '~/constants';
import { pools } from '~/data';
import { Composition } from '~/types/components/contracts';
import { PoolBalance, TOKEN } from '~/types/contracts';
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

interface GetPoolInfoById {
  id: string;
  lpTokenBalance: string;
  totalLpTokenBalance: bigint;
  poolBalance: PoolBalance;
}
export const getPoolInfoById = ({
  id,
  lpTokenBalance,
  totalLpTokenBalance,
  poolBalance,
}: GetPoolInfoById) => {
  const pool = pools.find(pool => pool.id === id)!;
  const { compositions, volume, apy, fees } = pool;

  const myCompositionsInfo: Composition[] = poolBalance?.[1]?.map(
    (balance: bigint, idx: number) => {
      const { name, weight } = compositions[idx];
      return {
        name,
        weight,
        balance: Number(formatEther(balance)),
        price: TOKEN_USD_MAPPER[name],
      };
    }
  );

  const totalBalances = formatNumber(
    myCompositionsInfo?.reduce((acc: number, cur) => acc + cur.balance * cur.price, 0) ?? 0,
    2
  );

  const myCompositions = myCompositionsInfo?.map(composition => {
    const balance =
      (Number(composition.balance) * Number(lpTokenBalance)) /
      Number(formatEther(totalLpTokenBalance as bigint));
    return {
      ...composition,
      balance,
      value: balance * composition.price,
    };
  });

  return { myCompositionsInfo, myCompositions, totalBalances, volume, apy, fees, pool };
};
