import { Address } from 'wagmi';

import { NETWORK } from '..';

export interface IToken {
  id: number;
  symbol: string; // token symbol
  network: NETWORK;

  address: string;
  currency: string;

  description?: string;

  image?: string; // token image url

  decimals?: number;
}

// [token addresses, balance, last change block number]
export type IPoolTokenBalanceRaw = [Address[], bigint[], bigint];

// TODO:
// export interface ITokenbalanceInPool {
//   balancesMap?: Record<string, Pick<IToken, 'symbol' | 'balance' | 'value'>>;
//   balancesArray?: Pick<IToken, 'symbol' | 'balance' | 'value'>[];
// }
