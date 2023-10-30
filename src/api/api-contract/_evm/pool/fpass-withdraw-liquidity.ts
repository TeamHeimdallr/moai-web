import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { WeightedPoolEncoder } from '@balancer-labs/sdk';
import { encodeFunctionData } from 'viem';
import {
  Address,
  useContractWrite,
  usePrepareContractWrite,
  usePublicClient,
  useWaitForTransaction,
} from 'wagmi';

import { EVM_CONTRACT_ADDRESS, EVM_TOKEN_ADDRESS } from '~/constants';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkFull } from '~/utils';
import { NETWORK } from '~/types';

import { BALANCER_VAULT_ABI } from '~/abi';
import { FUTUREPASS_ABI } from '~/abi/futurepass';

interface Props {
  poolId: string;
  tokens: string[]; // token symbol
  amount: bigint; // withdraw lp token amount. amounts out are calculated by exitExactBPTInForTokensOut function

  enabled?: boolean;
}

export const useWithdrawLiquidity = ({ poolId, tokens, amount, enabled }: Props) => {
  const publicClient = usePublicClient();
  const { fpass } = useConnectedWallet();
  const { address: walletAddress, signer } = fpass;

  const { network } = useParams();
  const { selectedNetwork, isFpass } = useNetwork();
  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;

  const chainId = useNetworkId(currentNetwork);

  const [blockTimestamp, setBlockTimestamp] = useState<number>(0);

  const handleNativeXrp = (token: string) => {
    if (currentNetwork !== NETWORK.EVM_SIDECHAIN) return token;

    if (token === EVM_TOKEN_ADDRESS?.[currentNetwork]?.ZERO)
      return EVM_TOKEN_ADDRESS?.[currentNetwork]?.XRP;
    return token;
  };
  const sortedTokens = tokens
    .slice()
    .sort((a, b) => handleNativeXrp(a).localeCompare(handleNativeXrp(b)));

  // TODO: connect to server. get vault address according to network and pool id
  const vault = EVM_CONTRACT_ADDRESS?.[currentNetwork]?.VAULT as Address;

  const encodedData = encodeFunctionData({
    abi: BALANCER_VAULT_ABI,
    functionName: 'exitPool',
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
  });

  const { isLoading: prepareLoading, config } = usePrepareContractWrite({
    address: walletAddress,
    abi: FUTUREPASS_ABI,
    functionName: 'proxyCall',

    account: signer as Address,
    chainId,
    value: BigInt(0),
    args: [1, vault, BigInt(0), encodedData],
    enabled: enabled && !!walletAddress && amount > 0 && isFpass,
  });

  const { data, writeAsync: writeAsyncBase } = useContractWrite(config);

  const {
    isLoading,
    isSuccess,
    data: txData,
  } = useWaitForTransaction({
    hash: data?.hash,
    enabled: !!data?.hash && isFpass,
  });

  const getBlockTimestamp = async () => {
    if (!txData || !txData.blockNumber || !isFpass) return;

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
