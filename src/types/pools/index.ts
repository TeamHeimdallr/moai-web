import { IToken, NETWORK } from '..';

export interface ITokenComposition extends IToken {
  weight: number;
}

export interface IPool {
  id: string;

  // lp token
  lpTokenName: string;
  lpTokenAddress: string;
  lpTokenTotalSupply: number;

  compositions: ITokenComposition[];

  formattedBalance: string;
  formattedValue: string;
  formattedVolume: string;
  formattedApr: string;
  formattedFees: string;

  balance: number;
  value: number;
  volume: number;
  apr: number;
  fees: number;
}

export interface IPoolList {
  id: string;
  network: NETWORK;

  assets: string[];
  compositions: ITokenComposition[];

  poolValue: number;
  volume: number;
  apr: number;
  balance: number;

  isNew?: boolean;
}
