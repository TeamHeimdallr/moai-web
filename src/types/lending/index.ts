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

  blocksPerYear: number;
  // interest rate model related fields
  // interestRateModel: Address;
  // kink: number; // 0~1
  // multiplierPerBlock: number;
  // jumpMultiplierPerBlock: number;
  // utilizationRate: number; // 0~1

  collateralFactorsMantissa: bigint;
}

export interface ISnapshot {
  error: bigint;
  mTokenBalance: bigint;
  mTokenAddress: Address;
  borrowBalance: bigint;
  exchangeRate: bigint;
  collateralFator?: bigint;
  isCollateral?: boolean;
}

export type IMarketWithToken = IMarket & {
  address: string;
  price?: number;

  underlyingSymbol?: string;
  underlyingImage?: string;
  underlyingBalance?: number;
};

export type IMTokenMetadata = {
  mToken: Address;
  exchangeRateCurrent: bigint;
  supplyRatePerBlock: bigint;
  borrowRatePerBlock: bigint;
  reserveFactorMantissa: bigint;
  totalBorrows: bigint;
  totalReserves: bigint;
  totalSupply: bigint;
  totalCash: bigint;
  isListed: boolean;
  collateralFactorMantissa: bigint;
  underlyingAssetAddress: Address;
  cTokenDecimals: bigint;
  underlyingDecimals: bigint;
  compSupplySpeed: bigint;
  compBorrowSpeed: bigint;
  borrowCap: bigint;
};
