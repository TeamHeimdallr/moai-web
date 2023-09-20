import { useState } from 'react';
import { parseUnits } from 'viem';
import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi';

import { TOKEN_ABI } from '~/abi/token';
import { CHAIN, CHAIN_ID } from '~/constants';

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
  const isRoot = CHAIN === 'root';
  const decimals = isRoot ? 6 : 18;

  const [allowance, setAllowance] = useState(false);

  const { isConnected, address: walletAddress } = useAccount();

  const { refetch } = useContractRead({
    address: tokenAddress,
    abi: TOKEN_ABI,
    functionName: 'allowance',
    args: [walletAddress, spender],
    enabled: enabled && !!walletAddress && !!spender,

    onSuccess: (data: string) => {
      return setAllowance(
        BigInt(data || 0) >= parseUnits((allowanceMin || 0)?.toString(), decimals)
      );
    },
    onError: () => setAllowance(false),
  });

  const { config } = usePrepareContractWrite({
    address: tokenAddress,
    abi: TOKEN_ABI,
    functionName: 'approve',
    chainId: CHAIN_ID,

    account: walletAddress,
    args: [spender, `${parseUnits(`${amount || 0}`, decimals)}`],
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
    refetch,

    allow: writeAsync,
  };
};
