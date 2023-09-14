export interface ChainInfo {
  CHAIN_ID: number;
  POOL_ID: Record<string, `0x${string}`>;
  CONTRACT_ADDRESS: Record<string, `0x${string}`>;
  TOKEN_ADDRESS: Record<string, `0x${string}`>;
  SCANNER_URL: string;
}
