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

import { VAULT_ABI } from '~/moai-xrp-evm/abi/vault';

import { CHAIN_ID, CONTRACT_ADDRESS } from '~/moai-xrp-evm/constants';

interface Props {
  enabled?: boolean;
  poolId: Address;
  request: {
    tokens: Address[];
    amount: bigint;
  };
}
export const useWithdrawLiquidity = ({ enabled, poolId, request }: Props) => {
  const { tokens, amount } = request;

  const publicClient = usePublicClient();
  const { isConnected, address: walletAddress } = useAccount();

  const [blockTimestamp, setBlockTimestamp] = useState<number>(0);

  const { isLoading: prepareLoading, config } = usePrepareContractWrite({
    address: CONTRACT_ADDRESS.VAULT,
    abi: VAULT_ABI,
    functionName: 'exitPool',
    chainId: CHAIN_ID,

    account: walletAddress,
    args: [
      poolId,
      walletAddress,
      walletAddress,
      [tokens, tokens.map(() => 0n), WeightedPoolEncoder.exitExactBPTInForTokensOut(amount), false],
    ],
    enabled: enabled && isConnected && amount > 0,
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
