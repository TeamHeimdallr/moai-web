import { formatEther } from 'viem';

import { TOKEN_USD_MAPPER } from '~/constants';
import { Composition } from '~/types/components/contracts';
import { TOKEN } from '~/types/contracts';
import { Entries } from '~/types/helpers';

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
  compositions: Composition[];
}
export const getPoolMyInfoById = ({
  lpTokenBalance,
  totalLpTokenBalance,
  compositions,
}: GetPoolInfoById) => {
  const myCompositions = compositions?.map(composition => {
    const balance =
      (Number(composition.balance) * Number(lpTokenBalance)) /
      Number(formatEther(totalLpTokenBalance as bigint));
    return {
      ...composition,
      balance,
      value: balance * composition.price,
    };
  });

  return { myCompositions };
};
