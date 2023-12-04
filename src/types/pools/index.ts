import { BaseResponse } from 'xrpl';

import { IToken, NETWORK } from '..';

export interface IPoolList {
  id: string;
  poolId: string;
  network: NETWORK;

  compositions: ITokenComposition[];

  value: number;
  volume: number;
  apr: number;
  moiApr: number;
}

export interface IMyPoolList {
  id: string;
  poolId: string;
  network: NETWORK;

  compositions: ITokenComposition[];

  balance: number;
  value: number;
  apr: number;
  moiApr: number;
}

export interface IMyPoolListRequest {
  walletAddress: string;
  lpTokens: {
    address: string;
    totalSupply: number;
    balance: number;
  }[];
}

export interface ITokenComposition extends IToken {
  balance?: number;
  price?: number;
  value?: number;

  weight?: number;
  currentWeight?: number;
}

export interface IPool {
  id: number;

  address: string;
  poolId: string;

  network: NETWORK;

  // lp token
  lpToken: IToken;

  compositions: ITokenComposition[];

  value: number;
  volume: number;
  apr: number;
  moiApr: number;
  tradingFee: number;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * @description 전체 Pool에서 Pool들을 구성하는 토큰 리스트. 필터링을 위해 사용
 */
export interface IPoolTokenList {
  symbol: string; // token symbol
  image?: string; // token image
}

export interface ILiquidityProvision {
  id: string;
  network: NETWORK;

  type: LIQUIDITY_PROVISION_TYPE;

  liquidityProvider: string;
  time: Date;
  txHash: string;

  liquidityProvisionTokens: ILiquidityProvisionToken[];
}

export interface ILiquidityProvisionToken extends IToken {
  type: LIQUIDITY_PROVISION_TYPE;
  amounts: number;
}

export enum LIQUIDITY_PROVISION_TYPE {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
}

export interface ISwapHistory {
  id: string;
  network: NETWORK;

  trader: string;
  time: Date;
  txHash: string;

  swapHistoryTokens: ISwapHistoryToken[];
}

export interface ISwapHistoryToken extends IToken {
  amounts: number;
  type: SWAP_HISTORY_TOKEN_TYPE;
}

export interface IPoolVaultAmm {
  id: number;
  network: NETWORK;

  vault?: string;
  ammAssets: IToken[];

  createdAt: Date;
  updatedAt: Date;
}

export enum POOL_CHART_TYPE {
  VOLUME = 'VOLUME',
  TVL = 'TVL',
  FEE = 'FEE',
}

export enum SWAP_HISTORY_TOKEN_TYPE {
  FROM = 'FROM',
  TO = 'TO',
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

export type SwapBatchSwapInput = [
  string, // pool id
  bigint, // asset in index
  bigint, // asset out index
  bigint, // amount
  string, // 0x0 하드코딩
];

export type SwapBatchSwapAsset = [
  string, // token address
];

/**
 * XRP
 */

export interface IAmmInfo extends BaseResponse {
  result: {
    amm: {
      account: string;
      amount: string;
      amount2: {
        currency: string;
        issuer: string;
        value: string;
      };
      asset2_frozen: boolean;
      auction_slot: {
        account: string;
        discounted_fee: number;
        expiration: string;
        price: {
          currency: string;
          issuer: string;
          value: string;
        };
        time_interval: number;
      };
      lp_token: {
        currency: string;
        issuer: string;
        value: string;
      };
      trading_fee: number;
      vote_slots: {
        account: string;
        trading_fee: number;
        vote_weight: number;
      }[];
    };
    ledger_current_index: number;
    validated: boolean;
  };
  status: string;
  type: string;
}
