import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Address, parseUnits } from 'viem';
import { useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi';

import { TOKEN_DECIMAL } from '~/constants';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkFull } from '~/utils';

import { ERC20_TOKEN_ABI } from '~/abi';

interface Props {
  amount?: number;
  symbol?: string;
  allowanceMin?: number;
  spender?: Address;
  tokenAddress?: Address;

  enabled?: boolean;
}
export const useApprove = ({
  amount,
  symbol,
  allowanceMin,
  spender,
  tokenAddress,

  enabled,
}: Props) => {
  const { network } = useParams();
  const { selectedNetwork, isEvm } = useNetwork();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const chainId = useNetworkId(currentNetwork);

  const [allowance, setAllowance] = useState(false);

  const { evm } = useConnectedWallet();
  const { isConnected, address: walletAddress } = evm;

  const isNativeXrp = symbol?.toLowerCase() === 'xrp';
  const internalEnabled = enabled && !!walletAddress && !!spender && isEvm && !isNativeXrp;

  const { isLoading: isReadLoading, refetch } = useContractRead({
    address: tokenAddress,
    abi: ERC20_TOKEN_ABI,
    functionName: 'allowance',
    chainId,
    args: [walletAddress, spender],
    enabled: internalEnabled,

    onSuccess: (data: string) => {
      return setAllowance(
        BigInt(data || 0) >=
          parseUnits((allowanceMin || 0)?.toString(), TOKEN_DECIMAL[currentNetwork])
      );
    },
    onError: () => setAllowance(false),
  });

  const { isLoading: isPrepareLoading, config } = usePrepareContractWrite({
    address: tokenAddress,
    abi: ERC20_TOKEN_ABI,
    functionName: 'approve',
    chainId,
    account: walletAddress as Address,
    args: [spender, `${parseUnits(`${amount || 0}`, TOKEN_DECIMAL[currentNetwork])}`],
    enabled: internalEnabled,
  });

  const { isLoading, isSuccess, writeAsync } = useContractWrite(config);

  const allow = async () => {
    if (!isEvm) return;

    await writeAsync?.();
  };

  if (isNativeXrp) {
    return {
      isLoading: false,
      isSuccess: true,
      allowance: true,
      refetch: () => {},
      allow: () => {},
    };
  }
  return {
    isLoading: isLoading || isReadLoading || isPrepareLoading,
    isSuccess,
    allowance: isConnected && allowance,
    refetch,
    allow,
  };
};
