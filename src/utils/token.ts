import { TOKEN, TOKEN_PRICE_MAPPER } from '~/constants';
import { Entries } from '~/types';

export const sumPoolValues = (object: Record<string, number>) =>
  (Object.entries(object) as Entries<Record<TOKEN, number>>).reduce<number>(
    (res, [token, value]) => {
      const tokenPrice = TOKEN_PRICE_MAPPER[token];
      return res + value * tokenPrice;
    },
    0
  );
