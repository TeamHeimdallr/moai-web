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

  price?: number;

  isLpToken: boolean;
  isCexListed: boolean;
}

export interface ICreateRecentlySelectedTokenRequest {
  network: NETWORK;
  walletAddress: string;
  tokenId: number;
}

// [token addresses, balance, last change block number]
export type IPoolTokenBalanceRaw = [Address[], bigint[], bigint];
