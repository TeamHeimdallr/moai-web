import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { WeightedPoolEncoder } from '@balancer-labs/sdk';
import {
  Address,
  useContractWrite,
  usePrepareContractWrite,
  usePublicClient,
  useWaitForTransaction,
} from 'wagmi';

import { EVM_CONTRACT_ADDRESS } from '~/constants';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkFull, getWrappedTokenAddress, isNativeToken } from '~/utils';
import { NETWORK } from '~/types';

import { BALANCER_VAULT_ABI } from '~/abi';

interface Props {
  poolId: string;
  tokens: string[];
  amountsIn: bigint[];

  enabled?: boolean;
}
export const useAddLiquidity = ({ poolId, tokens, amountsIn, enabled }: Props) => {
  const { network } = useParams();
  const publicClient = usePublicClient();
  const { evm } = useConnectedWallet();
  const { isConnected, address: walletAddress } = evm;

  const { selectedNetwork, isEvm } = useNetwork();
  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;

  const chainId = useNetworkId(currentNetwork);

  const [blockTimestamp, setBlockTimestamp] = useState<number>(0);

  const handleNativeXrp = (token: string) => {
    if (currentNetwork !== NETWORK.EVM_SIDECHAIN) return token;

    if (isNativeToken({ address: token as Address, network: currentNetwork }))
      return getWrappedTokenAddress(currentNetwork) ?? token;
    return token;
  };
  const sortedTokens = tokens
    .slice()
    .sort((a, b) => handleNativeXrp(a).localeCompare(handleNativeXrp(b)));
  const sortedIndex = sortedTokens.map(token => tokens.findIndex(t => t === token));
  const sortedAmountsIn = sortedIndex.map(index => amountsIn[index]);
  const nativeIndex = sortedTokens.findIndex(token =>
    isNativeToken({ address: token as Address, network: currentNetwork })
  );

  // TODO: connect to server. get vault address according to network and pool id
  const vault = EVM_CONTRACT_ADDRESS?.[currentNetwork]?.VAULT as Address;

  const { isLoading: prepareLoading, config } = usePrepareContractWrite({
    address: vault,
    abi: BALANCER_VAULT_ABI,
    functionName: 'joinPool',

    account: walletAddress as Address,
    chainId,
    value: nativeIndex === -1 ? 0n : sortedAmountsIn[nativeIndex],
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
    enabled: enabled && isConnected && isEvm,
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
