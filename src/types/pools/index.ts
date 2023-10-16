import { BaseResponse } from 'xrpl';

import { IToken, NETWORK } from '..';

/**
 * EVM
 */
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

/**
 * XRP
 */
export interface IAmm {
  id: string;
  lpTokenName: string;
  lpTokenCurrency: string;

  assets: {
    asset1: {
      currency: string;
      issuer?: string;
    };
    asset2: {
      currency: string;
      issuer?: string;
    };
  };
}

export interface IAmmResponse extends BaseResponse {
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

export interface IFormattedAmmResponse {
  account: string;

  poolTotalValue: number;
  fee: number;

  token1: {
    currency: string;
    issuer?: string;
    balance: number;
    price: number;
    value: number;
    weight: number;
  };
  token2: {
    currency: string;
    issuer?: string;
    balance: number;
    price: number;
    value: number;
    weight: number;
  };
  liquidityPoolToken: {
    currency: string;
    issuer: string;
    balance: number;
    price: number;
    value: number;
  };
}
