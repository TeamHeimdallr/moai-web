import { useEffect, useState } from 'react';
import {
  useContractWrite,
  usePrepareContractWrite,
  usePublicClient,
  useWaitForTransaction,
} from 'wagmi';

import { VAULT_ABI } from '~/moai-evm/abi/vault';

import { CONTRACT_ADDRESS } from '~/moai-evm/constants';

import { useConnectWallet } from '~/moai-evm/hooks/data/use-connect-wallet';
import { SwapFundManagementInput, SwapSingleSwapInput } from '~/moai-evm/types/contracts';

interface Props {
  enabled?: boolean;
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
  enabled = true,
}: Props) => {
  const [blockTimestamp, setBlockTimestamp] = useState<number>(0);

  const publicClient = usePublicClient();
  const { address } = useConnectWallet();

  const isEnabled = !!singleSwap && !!fundManagement && !!address && enabled;

  const { config, error } = usePrepareContractWrite({
    address: CONTRACT_ADDRESS.VAULT,
    abi: VAULT_ABI,
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
