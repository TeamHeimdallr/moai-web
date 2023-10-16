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

export type SwapFundManagementInput = [
  string, // 지갑주소
  boolean, // false
  string, // 지갑주소
  boolean, // false
];

export enum SwapKind {
  GivenIn = 0,
  GivenOut = 1,
}

export type SwapSingleSwapInput = [
  string, // id
  SwapKind, // 들어가는 양이 정해진거니까 0으로 하면됨
  string, // token address
  string, // token address
  bigint, // 18
  string, // 0x0 하드코딩
];
