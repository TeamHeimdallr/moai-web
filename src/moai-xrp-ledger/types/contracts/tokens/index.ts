export enum TOKEN {
  MOI = 'MOI',
  XRP = 'XRP',
}

export interface TokenInfo {
  issuer: string;
  name: string;
  logoURI: string;
}

export interface TokenBalanceInfo {
  balance: number;
  value: number;
  name: string;
}

export interface TokenBalanceInfoAll {
  balancesMap?: Record<string, TokenBalanceInfo>;
  balancesArray?: TokenBalanceInfo[];
}