import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { encodeFunctionData } from 'viem';
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
import { getNetworkAbbr, getNetworkFull } from '~/utils';
import { SwapFundManagementInput, SwapSingleSwapInput } from '~/types';

import { BALANCER_VAULT_ABI } from '~/abi';
import { FUTUREPASS_ABI } from '~/abi/futurepass';

interface Props {
  poolId: string;

  singleSwap: SwapSingleSwapInput;
  fundManagement: SwapFundManagementInput;
  limit?: bigint;
  deadline?: number;
  proxyEnabled?: boolean;
}
export const useSwap = ({
  poolId,

  singleSwap,
  fundManagement,
  limit = BigInt(10),
  deadline = 2000000000,
  proxyEnabled,
}: Props) => {
  const publicClient = usePublicClient();

  const { network } = useParams();
  const { fpass } = useConnectedWallet();
  const { address: walletAddress, signer } = fpass;

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

  const encodedData =
    isFpass && !!walletAddress && !!signer && !!vault
      ? encodeFunctionData({
          abi: BALANCER_VAULT_ABI,
          functionName: 'swap',
          args: [singleSwap, fundManagement, limit, deadline],
        })
      : '0x0';

  const {
    isLoading: prepareLoading,
    config,
    isError,
  } = usePrepareContractWrite({
    address: (vault || '') as Address,
    abi: FUTUREPASS_ABI,
    functionName: 'proxyCall',

    account: signer as Address,
    chainId,
    value: BigInt(0),
    args: [1, vault, BigInt(0), encodedData],
    enabled:
      proxyEnabled &&
      !!vault &&
      !!singleSwap &&
      !!fundManagement &&
      !!walletAddress &&
      isFpass &&
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

  useEffect(() => {
    getBlockTimestamp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txData]);

  const writeAsync = async () => {
    await writeAsyncBase?.();
  };

  return {
    isLoading: prepareLoading || isLoading,
    isSuccess,
    isError,

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    txData,
    blockTimestamp,

    swap: writeAsync,
  };
};
