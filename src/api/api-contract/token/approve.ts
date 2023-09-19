import { useState } from 'react';
import { parseEther } from 'viem';
import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi';

import { TOKEN_ABI } from '~/abi/token';
import { CHAIN_ID } from '~/constants';

interface Props {
  enabled?: boolean;
  amount?: number;

  allowanceMin?: number;
  spender?: `0x${string}`;
  tokenAddress?: `0x${string}`;
}
export const useTokenApprove = ({
  enabled,
  amount,
  allowanceMin,
  spender,
  tokenAddress,
}: Props) => {
  const [allowance, setAllowance] = useState(false);

  const { isConnected, address: walletAddress } = useAccount();

  useContractRead({
    address: tokenAddress,
    abi: TOKEN_ABI,
    functionName: 'allowance',
    args: [walletAddress, spender],
    enabled: enabled && !!walletAddress && !!spender,

    onSuccess: (data: string) => {
      return setAllowance(BigInt(data || 0) > parseEther((allowanceMin || 0)?.toString()));
    },
    onError: () => setAllowance(false),
  });

  const { config } = usePrepareContractWrite({
    address: tokenAddress,
    abi: TOKEN_ABI,
    functionName: 'approve',
    chainId: CHAIN_ID,

    account: walletAddress,
    args: [spender, `${parseEther(`${amount || 0}`)}`],
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
