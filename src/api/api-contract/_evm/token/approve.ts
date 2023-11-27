import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Address, parseUnits } from 'viem';
import { useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkFull, getTokenDecimal, isNativeToken } from '~/utils';

import { ERC20_TOKEN_ABI } from '~/abi';

interface Props {
  amount?: number;
  allowanceMin?: number;
  spender?: Address;
  tokenAddress?: Address;
  symbol?: string;

  enabled?: boolean;
}
export const useApprove = ({
  amount,
  allowanceMin,
  spender,
  tokenAddress,
  symbol,

  enabled,
}: Props) => {
  const { network } = useParams();
  const { selectedNetwork, isEvm } = useNetwork();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const chainId = useNetworkId(currentNetwork);

  const [allowance, setAllowance] = useState(false);

  const { evm } = useConnectedWallet();
  const { isConnected, address: walletAddress } = evm;

  const internalEnabled =
    enabled &&
    !!walletAddress &&
    !!spender &&
    isEvm &&
    !isNativeToken({ address: tokenAddress, network: currentNetwork });

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
          parseUnits((allowanceMin || 0)?.toString(), getTokenDecimal(currentNetwork, symbol))
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
    args: [spender, `${parseUnits(`${amount || 0}`, getTokenDecimal(currentNetwork, symbol))}`],
    enabled: internalEnabled,
  });

  const { isLoading, isSuccess, writeAsync } = useContractWrite(config);

  const allow = async () => {
    if (!isEvm) return;

    await writeAsync?.();
  };

  return {
    isLoading: isLoading || isReadLoading || isPrepareLoading,
    isSuccess,
    allowance:
      (isConnected && allowance) ||
      isNativeToken({ address: tokenAddress, network: currentNetwork }),
    refetch,
    allow,
  };
};
