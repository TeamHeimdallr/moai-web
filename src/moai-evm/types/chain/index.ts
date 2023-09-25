import { Address } from 'viem';

export interface ChainInfo {
  CHAIN_ID: number;
  POOL_ID: Record<string, Address>;
  CONTRACT_ADDRESS: Record<string, Address>;
  TOKEN_ADDRESS: Record<string, Address>;
  SCANNER_URL: string;
}
