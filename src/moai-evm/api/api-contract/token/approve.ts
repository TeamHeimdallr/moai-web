import { useState } from 'react';
import { Address, parseUnits } from 'viem';
import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi';

import { TOKEN_ABI } from '~/moai-evm/abi/token';

import { CHAIN_ID, TOKEN_DECIAML } from '~/moai-evm/constants';

interface Props {
  enabled?: boolean;
  amount?: number;

  allowanceMin?: number;
  spender?: Address;
  tokenAddress?: Address;
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

  const { refetch } = useContractRead({
    address: tokenAddress,
    abi: TOKEN_ABI,
    functionName: 'allowance',
    args: [walletAddress, spender],
    enabled: enabled && !!walletAddress && !!spender,
    staleTime: Infinity,

    onSuccess: (data: string) => {
      return setAllowance(
        BigInt(data || 0) >= parseUnits((allowanceMin || 0)?.toString(), TOKEN_DECIAML)
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
    args: [spender, `${parseUnits(`${amount || 0}`, TOKEN_DECIAML)}`],
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
