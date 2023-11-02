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

import { EVM_CONTRACT_ADDRESS } from '~/constants';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkFull } from '~/utils';
import { SwapFundManagementInput, SwapSingleSwapInput } from '~/types';

import { BALANCER_VAULT_ABI } from '~/abi';
import { FUTUREPASS_ABI } from '~/abi/futurepass';

interface Props {
  singleSwap: SwapSingleSwapInput;
  fundManagement: SwapFundManagementInput;
  limit?: bigint;
  deadline?: number;
}
export const useSwap = ({
  singleSwap,
  fundManagement,
  limit = BigInt(10),
  deadline = 2000000000,
}: Props) => {
  const [blockTimestamp, setBlockTimestamp] = useState<number>(0);
  const { network } = useParams();
  const { selectedNetwork, isFpass } = useNetwork();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const chainId = useNetworkId(currentNetwork);

  const publicClient = usePublicClient();
  const { fpass } = useConnectedWallet();
  const { address, signer } = fpass;

  const contractAddress = EVM_CONTRACT_ADDRESS?.[currentNetwork]?.VAULT as Address;

  const encodedData = isFpass
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
    address: address as Address,
    abi: FUTUREPASS_ABI,
    functionName: 'proxyCall',

    account: signer as Address,
    chainId,
    value: BigInt(0),
    args: [1, contractAddress, BigInt(0), encodedData],
    enabled: !!contractAddress && !!singleSwap && !!fundManagement && !!address && isFpass,
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
    txData: txData as any,
    blockTimestamp,

    swap: writeAsync,
  };
};
