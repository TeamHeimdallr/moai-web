import { useEffect, useState } from 'react';
import {
  useContractWrite,
  usePrepareContractWrite,
  usePublicClient,
  useWaitForTransaction,
} from 'wagmi';

import { VAULT_ABI } from '~/abi/mantle/vault';
import { CONTRACT_ADDRESS } from '~/constants';
import { useConnectWallet } from '~/hooks/data/use-connect-wallet';
import { SwapFundManagementInput, SwapSingleSwapInput } from '~/types/contracts';

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

  const publicClient = usePublicClient();

  const { address } = useConnectWallet();
  const enabled = !!singleSwap && !!fundManagement && !!address;

  const { config, error } = usePrepareContractWrite({
    address: CONTRACT_ADDRESS.VAULT,
    abi: VAULT_ABI,
    functionName: 'swap',
    args: [singleSwap, fundManagement, limit, deadline],
    enabled,
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
    if (!txData?.blockNumber) return;

    const { timestamp } = await publicClient.getBlock({ blockNumber: txData.blockNumber });
    setBlockTimestamp(Number(timestamp));
  };

  useEffect(() => {
    getBlockTimestamp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txData?.blockNumber]);

  return {
    isLoading: isLoading || fetchStatus === 'fetching',
    isSuccess: !!txData || !!blockTimestamp,
    error,

    data,
    txData,
    blockTimestamp,
    swap: writeAsync,
  };
};
