import { useState } from 'react';
import { parseEther } from 'viem';
import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi';

import { TOKEN_ABI } from '~/abi/sample-token';
import { CONTRACT_ADDRESS, DEFAULT_CHAIN_ID } from '~/constants';

interface Props {
  enabled?: boolean;
  amount?: number;

  allowanceMin?: number;
}
export const useTokenApprove = ({ enabled, amount, allowanceMin }: Props) => {
  const [allowance, setAllowance] = useState(false);

  const { isConnected, address: walletAddress } = useAccount();

  useContractRead({
    address: CONTRACT_ADDRESS.CONTRACT_NAME,
    abi: TOKEN_ABI,
    functionName: 'allowance',
    args: [walletAddress, CONTRACT_ADDRESS.CONTRACT_NAME],
    enabled: enabled && !!walletAddress,

    onSuccess: (data: string) => setAllowance(BigInt(data || 0) > (allowanceMin || 0)),
    onError: () => setAllowance(false),
  });

  const { config } = usePrepareContractWrite({
    address: CONTRACT_ADDRESS.CONTRACT_NAME,
    abi: TOKEN_ABI,
    functionName: 'approve',
    chainId: DEFAULT_CHAIN_ID,

    account: walletAddress,
    args: [CONTRACT_ADDRESS.CONTRACT_NAME, `${parseEther(`${amount || 0}`)}`],
    enabled: true,
  });

  const { data, writeAsync } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
    enabled: !!data?.hash,
  });

  return {
    allowance: isConnected && allowance,
    isLoading,
    isSuccess,

    allow: writeAsync,
  };
};
