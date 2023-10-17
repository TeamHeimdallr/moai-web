import { useEffect, useState } from 'react';
import { WeightedPoolEncoder } from '@balancer-labs/sdk';
import {
  Address,
  useContractWrite,
  usePrepareContractWrite,
  usePublicClient,
  useWaitForTransaction,
} from 'wagmi';

import { EVM_CONTRACT_ADDRESS, EVM_TOKEN_ADDRESS } from '~/constants';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { NETWORK } from '~/types';

import { BALANCER_VAULT_ABI } from '~/abi';

interface Props {
  poolId: string;
  tokens: string[];
  amount: bigint;

  enabled?: boolean;
}

export const useWithdrawLiquidity = ({ poolId, tokens, amount, enabled }: Props) => {
  const publicClient = usePublicClient();
  const { evm } = useConnectedWallet();
  const { address: walletAddress } = evm;

  const { selectedNetwork, isEvm } = useNetwork();

  const [blockTimestamp, setBlockTimestamp] = useState<number>(0);

  const handleNativeXrp = (token: string) => {
    if (selectedNetwork !== NETWORK.EVM_SIDECHAIN) return token;

    if (token === EVM_TOKEN_ADDRESS?.[selectedNetwork]?.ZERO)
      return EVM_TOKEN_ADDRESS?.[selectedNetwork]?.XRP;
    return token;
  };
  const sortedTokens = tokens
    .slice()
    .sort((a, b) => handleNativeXrp(a).localeCompare(handleNativeXrp(b)));

  // TODO: connect to server. get vault address according to network and pool id
  const vault = EVM_CONTRACT_ADDRESS[selectedNetwork].VAULT as Address;

  const { isLoading: prepareLoading, config } = usePrepareContractWrite({
    address: vault,
    abi: BALANCER_VAULT_ABI,
    functionName: 'exitPool',

    account: walletAddress as Address,
    args: [
      poolId,
      walletAddress,
      walletAddress,
      [
        sortedTokens,
        tokens.map(() => 0n),
        WeightedPoolEncoder.exitExactBPTInForTokensOut(amount),
        false,
      ],
    ],
    enabled: enabled && !!walletAddress && amount > 0 && isEvm,
  });

  const { data, writeAsync: writeAsyncBase } = useContractWrite(config);

  const {
    isLoading,
    isSuccess,
    data: txData,
  } = useWaitForTransaction({
    hash: data?.hash,
    enabled: !!data?.hash && isEvm,
  });

  const getBlockTimestamp = async () => {
    if (!txData || !txData.blockNumber || !isEvm) return;

    const { timestamp } = await publicClient.getBlock({ blockNumber: txData.blockNumber });
    setBlockTimestamp(Number(timestamp) * 1000);
  };

  const writeAsync = async () => {
    await writeAsyncBase?.();
  };

  useEffect(() => {
    getBlockTimestamp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txData]);

  return {
    isLoading: prepareLoading || isLoading,
    isSuccess,

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    txData: txData as any,
    blockTimestamp,

    writeAsync,
  };
};
