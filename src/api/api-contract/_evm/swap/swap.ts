import { useEffect, useState } from 'react';
import {
  Address,
  useContractWrite,
  usePrepareContractWrite,
  usePublicClient,
  useWaitForTransaction,
} from 'wagmi';

import { EVM_CONTRACT_ADDRESS } from '~/constants';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
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
  const { selectedNetwork, isEvm } = useNetwork();

  const publicClient = usePublicClient();
  const { evm } = useConnectedWallet();
  const { address } = evm;

  const { isLoading: prepareLoading, config } = usePrepareContractWrite({
    address: EVM_CONTRACT_ADDRESS[selectedNetwork].VAULT as Address,
    abi: BALANCER_VAULT_ABI,
    functionName: 'swap',
    args: [singleSwap, fundManagement, limit, deadline],
    enabled: !!singleSwap && !!fundManagement && !!address && isEvm,
  });

  const { data, writeAsync } = useContractWrite(config);

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

  return {
    isLoading: prepareLoading || isLoading,
    isSuccess,

    txData,
    blockTimestamp,

    swap: writeAsync,
  };
};
