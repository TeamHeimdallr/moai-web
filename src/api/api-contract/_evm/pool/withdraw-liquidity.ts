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

import { useGetPoolVaultAmmQuery } from '~/api/api-server/pools/get-pool-vault-amm';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkAbbr, getNetworkFull, getWrappedTokenAddress, isNativeToken } from '~/utils';
import { ITokenComposition, NETWORK } from '~/types';

import { BALANCER_VAULT_ABI } from '~/abi';

interface Props {
  poolId: string;
  tokens: ITokenComposition[];
  bptIn: bigint;

  enabled?: boolean;
}

export const useWithdrawLiquidity = ({ poolId, tokens, bptIn, enabled }: Props) => {
  const publicClient = usePublicClient();
  const { evm } = useConnectedWallet();
  const { isConnected, address: walletAddress } = evm;

  const { network } = useParams();
  const { selectedNetwork, isEvm } = useNetwork();
  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const currentNetworkAbbr = getNetworkAbbr(currentNetwork);

  const chainId = useNetworkId(currentNetwork);
  const { data: poolVaultAmmData } = useGetPoolVaultAmmQuery(
    {
      params: {
        networkAbbr: currentNetworkAbbr as string,
        poolId: poolId as string,
      },
    },
    {
      enabled: !!poolId && !!currentNetworkAbbr,
      cacheTime: Infinity,
      staleTime: Infinity,
    }
  );
  const { poolVaultAmm } = poolVaultAmmData || {};
  const { vault } = poolVaultAmm || {};

  const [blockTimestamp, setBlockTimestamp] = useState<number>(0);

  const handleNativeXrp = (token: string) => {
    if (currentNetwork !== NETWORK.EVM_SIDECHAIN) return token;

    if (isNativeToken({ address: token as Address, network: currentNetwork }))
      return getWrappedTokenAddress(currentNetwork) ?? token;
    return token;
  };
  const sortedTokens = tokens
    .slice()
    .sort((a, b) => handleNativeXrp(a.address).localeCompare(handleNativeXrp(b.address)));

  const { isLoading: prepareLoading, config } = usePrepareContractWrite({
    address: (vault || '') as Address,
    abi: BALANCER_VAULT_ABI,
    functionName: 'exitPool',

    account: walletAddress as Address,
    chainId,
    args: [
      poolId,
      walletAddress,
      walletAddress,
      [
        sortedTokens,
        tokens.map(() => 0n),
        WeightedPoolEncoder.exitExactBPTInForTokensOut(bptIn),
        false,
      ],
    ],
    enabled: enabled && isConnected && isEvm && !!walletAddress && bptIn > 0 && !!vault,
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
