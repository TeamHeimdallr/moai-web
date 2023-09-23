import { useEffect, useState } from 'react';
import { WeightedPoolEncoder } from '@balancer-labs/balancer-js';
import { Address } from 'viem';
import {
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  usePublicClient,
  useWaitForTransaction,
} from 'wagmi';

import { VAULT_ABI } from '~/moai-xrp-root/abi/vault';

import { CHAIN_ID, CONTRACT_ADDRESS } from '~/moai-xrp-root/constants';

interface Props {
  enabled?: boolean;
  poolId: Address;
  request: {
    tokens: Address[];
    amountsIn: bigint[];
  };
}
export const useAddLiquidity = ({ enabled, poolId, request }: Props) => {
  const publicClient = usePublicClient();
  const { isConnected, address: walletAddress } = useAccount();

  const [blockTimestamp, setBlockTimestamp] = useState<number>(0);

  const sortedTokens = request.tokens.slice().sort((a, b) => a.localeCompare(b));
  const sortedIndex = sortedTokens.map(token => request.tokens.findIndex(t => t === token));
  const sortedAmountsIn = sortedIndex.map(index => request.amountsIn[index]);

  const { isLoading: prepareLoading, config } = usePrepareContractWrite({
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
    isSuccess,
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
    isLoading: prepareLoading || isLoading,
    isSuccess,

    txData,
    blockTimestamp,

    writeAsync,
  };
};
