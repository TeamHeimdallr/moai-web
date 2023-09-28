import { BaseResponse } from 'xrpl';

export interface Amm {
  asset1: {
    currency: string;
    issuer?: string;
  };
  asset2: {
    currency: string;
    issuer?: string;
  };
}

export interface AmmResponse extends BaseResponse {
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

export interface FormattedAmmResponse {
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
