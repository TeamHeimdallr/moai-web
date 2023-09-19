import { Address } from 'viem';

export interface SwapFundManagement {
  sender: string; // 지갑주소
  fromInternalBalance: boolean; // false
  recipient: string; // 지갑주소
  toInternalBalance: boolean; // false
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

export interface SwapSingleSwap {
  poolId: string; // id
  kind: SwapKind; // 들어가는 양이 정해진거니까 0으로 하면됨
  assetIn: string; // token address
  assetOut: string; // token address
  amount: bigint; // 18
  userData: string; // 0x 하드코딩
}

export type SwapSingleSwapInput = [
  string, // id
  SwapKind, // 들어가는 양이 정해진거니까 0으로 하면됨
  string, // token address
  string, // token address
  bigint, // 18
  string, // 0x 하드코딩
];

export interface getSwapHistoriesTokens {
  address: Address;
  symbol: string;
  amount: number;
}

export interface GetSwapHistories {
  poolId: Address;
  trader: Address;
  tokens: getSwapHistoriesTokens[];
  time: number;
  txHash: Address;
}
