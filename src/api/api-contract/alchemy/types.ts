import { UseMutationOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';

/**
 * common
 */
export type Category = 'external' | 'internal' | 'erc20' | 'erc721' | 'erc1155' | 'specialnft';

/**
 * Post Asset Transfers
 */
/**
 * request
 */
export interface GetAssetTransfers {
  walletAddress: `0x${string}`;
}

export interface GetAssetTransfersRequestParams {
  contractAddresses?: `0x${string}`[];
  category: Category[];
  fromAddress?: `0x${string}`;
  toAddress?: `0x${string}`;
  fromBlock?: string;
  toBlock?: string;
  order?: 'asc' | 'desc';
  withMetadata?: boolean;
  excludeZeroValue?: boolean;
  maxCount?: string;
  pageKey?: string;
}

export interface GetAssetTransfersRequest {
  id?: number;
  jsonrpc?: string;
  method: 'alchemy_getAssetTransfers';
  params?: GetAssetTransfersRequestParams[];
}

/**
 * response
 */
export interface RawContract {
  value: string | null;
  address: string | null;
  decimal: string | null;
}
export interface Metadata {
  blockTimestamp: string;
}
export interface Erc1155Metadata {
  toeknId: string;
  value: string;
}
export interface Transfers {
  category: Category;
  blockNum: string;
  from: string;
  to: string | null;
  value: string | null;
  erc721TokenId: string | null;
  erc1155Metadata: Erc1155Metadata[] | null;
  tokenId: string;
  asset: string | null;
  uniqueId: string;
  hash: string;
  rawContract: RawContract;
  metadata: Metadata;
}

export interface GetAssetTransfersResponseResult {
  pageKey?: string;
  transfers: Transfers[];
}
export interface GetAssetTransfersResponse {
  id: number;
  jsonrpc: string;
  result: GetAssetTransfersResponseResult;
}

export type UseAlchemyPostAssetTransfers = UseMutationOptions<
  Transfers[],
  AxiosError<Transfers[], GetAssetTransfers>,
  GetAssetTransfers
>;

/**
 * Get NFTs
 */

/**
 * request
 */
export interface GetNftsRequest {
  owner: string;
  'contractAddresses[]'?: `0x${string}`[];
}

/**
 * response
 */
export interface NftContract {
  address: string;
}
export interface NftId {
  tokenId: string;
  toekeMetadata: {
    tokenType: string;
  };
}
export interface TokenUrl {
  gateway: string;
  raw: string;
}
export interface TokenMedia {
  gateway: string;
  thumbnail: string;
  raw: string;
  format: string;
  bytes: number;
}
export interface TokenMetadata {
  name: string;
  image: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attributes: any[];
}

export interface ContractMetadata {
  name: string;
  symbol: string;
  totalSupply: string;
  tokenType: string;
  contractDeployer: string;
  deployedBlockNumber: number;
  openSea: {
    lastIngestedAt: string;
  };
}

export interface OwnerNft {
  contract: NftContract;
  id: NftId;
  balance: string;
  title: string;
  description: string;
  tokenUri: TokenUrl;
  media: TokenMedia[];
  metadata: TokenMetadata;
  timeLastUpdated: string; // data string
  contractMetadata: ContractMetadata;
}

export interface GetNftsResponse {
  ownedNfts: OwnerNft[];
  totalCount: number;
  blockHash: string;
}

/**
 * Get owners for token
 */

/**
 * request
 */
export interface GetOwnersForTokenRequest {
  contractAddress: `0x${string}`;
  tokenId: string;
}

/**
 * response
 */
export interface GetOwnersForTokenResponse {
  owners: `0x${string}`[];
}

/**
 * Get owners for collection
 */

/**
 * request
 */
export interface GetOwnersForCollectionRequest {
  contractAddress: `0x${string}`;
}

/**
 * response
 */
export interface GetOwnersForCollectionResponse {
  ownerAddresses: `0x${string}`[];
}

/**
 * Get contract metadata
 */

/**
 * request
 */
export interface GetContractMetadataRequest {
  contractAddress: `0x${string}`;
}

/**
 * response
 */
export interface GetContractMetadataResponse {
  address: `0x${string}`;
  contractMetadata: {
    name: string;
    symbol: string;
    tokenType: string;
    openSea: {
      lastIngestedAt: string;
    };
  };
}

/**
 * Post get token balance
 */

/**
 * request
 */
export interface PostGetTokenBalanceRequest {
  id?: number;
  jsonrpc: '2.0';
  method: 'alchemy_getTokenBalances';
  params: [string, `0x${string}`[]];
}

/**
 * response
 */
export interface PostGetTokenBalanceResponse {
  jsonrpc: string;
  id: number;
  result: {
    address: string;
    tokenBalances: {
      contractAddress: string;
      tokenBalance: string;
    }[];
    pageKey: string;
  };
}

export interface PostGetTokenBalance {
  walletAddress: `0x${string}`;
}
export interface TokenBalance {
  balance: string;
}
export type UseAlchemyPostGetTokenBalance = UseMutationOptions<
  TokenBalance,
  AxiosError<TokenBalance, PostGetTokenBalance>,
  PostGetTokenBalance
>;
