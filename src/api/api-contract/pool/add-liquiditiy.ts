import { WeightedPoolEncoder } from '@balancer-labs/balancer-js';
import { useEffect, useState } from 'react';
import {
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  usePublicClient,
  useWaitForTransaction,
} from 'wagmi';

import { VAULT_ABI } from '~/abi/vault';
import { CHAIN_ID, CONTRACT_ADDRESS } from '~/constants';

interface Props {
  enabled?: boolean;
  poolId: `0x${string}`;
  request: {
    tokens: `0x${string}`[];
    amountsIn: bigint[];
  };
}
export const useAddLiquidity = ({ enabled, poolId, request }: Props) => {
  const { isConnected, address: walletAddress } = useAccount();
  const [blockTimestamp, setBlockTimestamp] = useState<number>(0);
  const publicClient = usePublicClient();

  const sortedTokens = request.tokens.slice().sort((a, b) => a.localeCompare(b));
  const sortedIndex = sortedTokens.map(token => request.tokens.findIndex(t => t === token));
  const sortedAmountsIn = sortedIndex.map(index => request.amountsIn[index]);

  const {
    isLoading: prepareLoading,
    status: prepareStatus,
    fetchStatus: prepareFetchStatus,
    config,
  } = usePrepareContractWrite({
    address: CONTRACT_ADDRESS.VAULT,
    abi: VAULT_ABI,
    functionName: 'joinPool',
    chainId: CHAIN_ID,

    account: walletAddress,
    args: [
      poolId,
      walletAddress,
      walletAddress,
      [
        sortedTokens,
        sortedAmountsIn,
        WeightedPoolEncoder.joinExactTokensInForBPTOut(sortedAmountsIn, '0'),
        false,
      ],
    ],
    enabled: enabled && isConnected,
  });

  const { data, writeAsync } = useContractWrite(config);

  const {
    isLoading,
    status,
    isSuccess,
    fetchStatus,
    data: txData,
  } = useWaitForTransaction({
    hash: data?.hash,
    enabled: !!data?.hash,
  });

  const getBlockTimestamp = async () => {
    if (!txData || !txData.blockNumber) return;

    const { timestamp } = await publicClient.getBlock({ blockNumber: txData.blockNumber });
    setBlockTimestamp(Number(timestamp) * 1000);
  };

  useEffect(() => {
    getBlockTimestamp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txData]);

  return {
    isLoading:
      prepareLoading ||
      prepareFetchStatus === 'fetching' ||
      prepareStatus === 'loading' ||
      isLoading ||
      fetchStatus === 'fetching' ||
      status === 'loading',
    isSuccess,
    txData,
    writeAsync,
    blockTimestamp,
  };
};
