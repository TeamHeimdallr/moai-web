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

import { useGetPoolVaultAmmQuery } from '~/api/api-server/pools/get-pool-vault-amm';

import { EVM_TOKEN_ADDRESS } from '~/constants';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkAbbr, getNetworkFull } from '~/utils';
import { ITokenComposition, NETWORK } from '~/types';

import { BALANCER_VAULT_ABI } from '~/abi';
import { FUTUREPASS_ABI } from '~/abi/futurepass';

interface Props {
  poolId: string;
  tokens: (ITokenComposition & { balance: number; amount: bigint })[];

  enabled?: boolean;
}
export const useAddLiquidity = ({ poolId, tokens, enabled }: Props) => {
  const publicClient = usePublicClient();

  const { network } = useParams();
  const { fpass } = useConnectedWallet();
  const { isConnected, address: walletAddress, signer } = fpass;

  const { selectedNetwork, isFpass } = useNetwork();
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

    if (token === EVM_TOKEN_ADDRESS?.[currentNetwork]?.ZERO)
      return EVM_TOKEN_ADDRESS?.[currentNetwork]?.XRP;
    return token;
  };

  const sortedTokens = tokens
    .slice()
    .sort((a, b) => handleNativeXrp(a.address).localeCompare(handleNativeXrp(b.address)));
  const sortedTokenAddressses = sortedTokens.map(t => t.address);
  const sortedAmountsIn = sortedTokens.map(t => t.amount);

  const encodedData =
    isFpass && !!walletAddress && !!signer && !!vault
      ? encodeFunctionData({
          abi: BALANCER_VAULT_ABI,
          functionName: 'joinPool',
          args: [
            poolId,
            walletAddress,
            walletAddress,
            [
              sortedTokenAddressses,
              sortedAmountsIn,
              WeightedPoolEncoder.joinExactTokensInForBPTOut(sortedAmountsIn, '0'),
              false,
            ],
          ],
        })
      : '0x0';

  const { isLoading: prepareLoading, config } = usePrepareContractWrite({
    address: walletAddress as Address,
    abi: FUTUREPASS_ABI,
    functionName: 'proxyCall',

    account: signer as Address,
    chainId,
    value: BigInt(0),
    args: [1, vault, BigInt(0), encodedData],
    enabled:
      enabled &&
      isConnected &&
      isFpass &&
      !!walletAddress &&
      !!signer &&
      !!vault &&
      encodedData !== '0x0',
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
