/**
 * Get trasnfer
 */
/**
 * request
 */
export interface GetTransferRequest {
  address: string;
}

/**
 * response
 */
export interface TransferResponseResult {
  blockNumber: string;
  timeStamp: string; // '1690911791'
  hash: string;
  from: string;
  to: string;
  value: string;
  contractAddress: string;
  input: string;
  type: string;
  gas: string;
  gasUsed: string;
  traceId: string;
  isError: string;
  errCode: string;
}

export interface GetTransferResponse {
  result: TransferResponseResult[];
}
