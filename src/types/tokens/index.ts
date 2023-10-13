export interface IToken {
  symbol: string; // token symbol

  address?: string;
  description?: string;

  image?: string; // token image url

  balance?: number; // current user balance or pool balance, lp token blanace
  price?: number; // token price. if token price determined by pool composition, value is 0
  value?: number; // token total value. equal to (balace * price)
}
