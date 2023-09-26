export interface GetSwapHistoriesTokens {
  name: string;
  balance: number;
  price: number;
  value: number;
}

export interface GetSwapHistories {
  account: string;
  trader: string;
  tokens: GetSwapHistoriesTokens[];
  time: number;
  txHash: string;
}
