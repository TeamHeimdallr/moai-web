import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { zeroAddress } from 'viem';
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

interface Props {
  poolId: string;

  singleSwap: SwapSingleSwapInput;
  fundManagement: SwapFundManagementInput;
  limit?: bigint;
  deadline?: number;

  enabled?: boolean;
}
export const useSwap = ({
  poolId,

  singleSwap,
  fundManagement,
  limit = BigInt(10),
  deadline = 2000000000,
  enabled,
}: Props) => {
  const publicClient = usePublicClient();

  const { network } = useParams();
  const { evm } = useConnectedWallet();
  const { address: walletAddress } = evm;

  const { selectedNetwork, isEvm, isFpass } = useNetwork();
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

  const {
    isLoading: prepareLoading,
    config,
    isError,
  } = usePrepareContractWrite({
    address: (vault || '') as Address,
    abi: BALANCER_VAULT_ABI,
    functionName: 'swap',
    chainId,
    value: singleSwap[2] === zeroAddress ? singleSwap[4] : 0n,
    args: [singleSwap, fundManagement, limit, deadline],
    enabled:
      enabled &&
      !!vault &&
      !!singleSwap &&
      !!fundManagement &&
      !!walletAddress &&
      isEvm &&
      !isFpass,
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

    txData,
    blockTimestamp,

    swap: writeAsync,
    estimateFee: () => {}, // TODO
  };
};
