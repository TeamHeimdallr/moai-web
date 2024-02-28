import { Address } from 'viem';

export enum LENDING_CHART_TYPE {
  SUPPLY = 'SUPPLY',
  BORROW = 'BORROW',
}

export interface IMarket {
  address: Address;
  decimals: number;
  underlyingAsset: Address;
  underlyingDecimals: number;
  symbol: string;

  supplyRatePerBlock: number;
  borrowRatePerBlock: number;
  supplyApy: number;
  borrowApy: number;

  totalReserves: bigint;
  totalBorrows: bigint;
  cash: bigint;

  initialExchangeRateMantissa: bigint;
  reserveFactorMantissa: bigint;

  totalSupply: bigint;

  // interest rate model related fields
  interestRateModel: Address;
  blocksPerYear: number;
  kink: number; // 0~1
  multiplierPerBlock: number;
  jumpMultiplierPerBlock: number;
  utilizationRate: number; // 0~1

  collateralFactorsMantissa: bigint;
}

export interface ISnapshot {
  error: bigint;
  mTokenBalance: bigint;
  mTokenAddress: Address;
  borrowBalance: bigint;
  exchangeRate: bigint;
  collateralFator?: bigint;
}

export type IMarketWithToken = IMarket & {
  address: string;
  price?: number;

  underlyingSymbol?: string;
  underlyingImage?: string;
  underlyingBalance?: number;
};
