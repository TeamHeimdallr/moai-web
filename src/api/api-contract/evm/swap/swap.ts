import { useEffect, useState } from 'react';
import {
  Address,
  useContractWrite,
  usePrepareContractWrite,
  usePublicClient,
  useWaitForTransaction,
} from 'wagmi';

import { EVM_CONTRACT_ADDRESS } from '~/constants';

import { useConnectedWallet } from '~/hooks/wallets';
import { useSelecteNetworkStore } from '~/states/data';
import { SwapFundManagementInput, SwapSingleSwapInput } from '~/types';

import { BALANCER_VAULT_ABI } from '~/abi';

interface Props {
  singleSwap: SwapSingleSwapInput;
  fundManagement: SwapFundManagementInput;
  limit?: number;
  deadline?: number;

  enabled?: boolean;
}
export const useSwap = ({
  singleSwap,
  fundManagement,
  limit = 10,
  deadline = 2000000000,
  enabled = true,
}: Props) => {
  const [blockTimestamp, setBlockTimestamp] = useState<number>(0);
  const { selectedNetwork } = useSelecteNetworkStore();

  const publicClient = usePublicClient();
  const { evm } = useConnectedWallet();
  const { address } = evm;

  const isEnabled = !!singleSwap && !!fundManagement && !!address && enabled;

  const { config, error } = usePrepareContractWrite({
    address: EVM_CONTRACT_ADDRESS[selectedNetwork].VAULT as Address,
    abi: BALANCER_VAULT_ABI,
    functionName: 'swap',
    args: [singleSwap, fundManagement, limit, deadline],
    enabled: isEnabled,
  });

  const { data, writeAsync } = useContractWrite(config);

  const {
    isLoading,
    fetchStatus,
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
    isLoading: isLoading || fetchStatus === 'fetching',
    isSuccess: !!txData,
    error,

    data,
    txData,
    blockTimestamp,
    swap: writeAsync,
  };
};
