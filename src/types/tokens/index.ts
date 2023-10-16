import { Address } from 'wagmi';

export interface IToken {
  symbol: string; // token symbol

  address?: string;
  description?: string;

  image?: string; // token image url

  balance?: number; // current user balance or pool balance, lp token blanace
  price?: number; // token price. if token price determined by pool composition, value is 0
  value?: number; // token total value. equal to (balace * price)
}

// [token addresses, balance, last change block number]
export type IPoolTokenBalanceRaw = [Address[], bigint[], bigint];

export interface ITokenbalanceInPool {
  balancesMap?: Record<string, Pick<IToken, 'symbol' | 'balance' | 'value'>>;
  balancesArray?: Pick<IToken, 'symbol' | 'balance' | 'value'>[];
}
