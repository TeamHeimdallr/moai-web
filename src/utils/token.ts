import { TOKEN_USD_MAPPER } from '~/constants';
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
