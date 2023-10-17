import { useState } from 'react';
import { Address, parseUnits } from 'viem';
import {
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi';

import { TOKEN_DECIMAL } from '~/constants';

import { useEvm } from '~/hooks/contexts';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';

import { ERC20_TOKEN_ABI } from '~/abi';

interface Props {
  amount?: number;
  allowanceMin?: number;
  spender?: Address;
  tokenAddress?: Address;

  enabled?: boolean;
}
export const useTokenApprove = ({
  amount,
  allowanceMin,
  spender,
  tokenAddress,

  enabled,
}: Props) => {
  const { selectedNetwork, isEvm } = useNetwork();
  const { chainId } = useEvm();
  const [allowance, setAllowance] = useState(false);

  const { evm } = useConnectedWallet();
  const { isConnected, address: walletAddress } = evm;

  const { refetch } = useContractRead({
    address: tokenAddress,
    abi: ERC20_TOKEN_ABI,
    functionName: 'allowance',
    args: [walletAddress, spender],
    enabled: enabled && !!walletAddress && !!spender && isEvm,

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

    account: walletAddress as Address,
    args: [spender, `${parseUnits(`${amount || 0}`, TOKEN_DECIMAL[selectedNetwork])}`],
    enabled: enabled && !!walletAddress && !!spender && isEvm,
  });

  const { data, writeAsync } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
    enabled: !!data?.hash && isEvm,
  });

  return {
    allowance: isConnected && allowance,
    isLoading,
    isSuccess,
    refetch,

    allow: writeAsync,
  };
};
