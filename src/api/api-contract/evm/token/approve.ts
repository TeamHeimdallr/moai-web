import { useState } from 'react';
import { Address, parseUnits } from 'viem';
import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi';

import { TOKEN_DECIMAL } from '~/constants';

import { useEvm } from '~/hooks/contexts';
import { useSelecteNetworkStore } from '~/states/data';

import { ERC20_TOKEN_ABI } from '~/abi';

interface Props {
  amount?: number;
  allowanceMin?: number;
  spender?: Address;
  tokenAddress?: Address;

  enabled?: boolean;
}
export const useTokenApprove = ({
  enabled,
  amount,
  allowanceMin,
  spender,
  tokenAddress,
}: Props) => {
  const { selectedNetwork } = useSelecteNetworkStore();
  const { chainId } = useEvm();
  const [allowance, setAllowance] = useState(false);

  const { isConnected, address: walletAddress } = useAccount();

  const { refetch } = useContractRead({
    address: tokenAddress,
    abi: ERC20_TOKEN_ABI,
    functionName: 'allowance',
    args: [walletAddress, spender],
    enabled: enabled && !!walletAddress && !!spender,

    onSuccess: (data: string) => {
      return setAllowance(
        BigInt(data || 0) >=
          parseUnits((allowanceMin || 0)?.toString(), TOKEN_DECIMAL[selectedNetwork])
      );
    },
    onError: () => setAllowance(false),
  });

  const { config } = usePrepareContractWrite({
    address: tokenAddress,
    abi: ERC20_TOKEN_ABI,
    functionName: 'approve',
    chainId,

    account: walletAddress,
    args: [spender, `${parseUnits(`${amount || 0}`, TOKEN_DECIMAL[selectedNetwork])}`],
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
