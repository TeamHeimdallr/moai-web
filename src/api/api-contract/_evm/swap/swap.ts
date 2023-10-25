import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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

interface Props {
  singleSwap: SwapSingleSwapInput;
  fundManagement: SwapFundManagementInput;
  limit?: number;
  deadline?: number;
}
export const useSwap = ({
  singleSwap,
  fundManagement,
  limit = 10,
  deadline = 2000000000,
}: Props) => {
  const [blockTimestamp, setBlockTimestamp] = useState<number>(0);
  const { network } = useParams();
  const { selectedNetwork, isEvm } = useNetwork();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const chainId = useNetworkId(currentNetwork);

  const publicClient = usePublicClient();
  const { evm } = useConnectedWallet();
  const { address } = evm;

  const contractAddress = EVM_CONTRACT_ADDRESS?.[currentNetwork]?.VAULT as Address;
  const { isLoading: prepareLoading, config } = usePrepareContractWrite({
    address: contractAddress,
    abi: BALANCER_VAULT_ABI,
    functionName: 'swap',
    chainId,
    args: [singleSwap, fundManagement, limit, deadline],
    enabled: !!contractAddress && !!singleSwap && !!fundManagement && !!address && isEvm,
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    txData: txData as any,
    blockTimestamp,

    swap: writeAsync,
  };
};
