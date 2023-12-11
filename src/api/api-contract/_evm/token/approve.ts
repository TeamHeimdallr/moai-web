import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Address } from 'viem';
import { useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkFull, getWrappedTokenAddress, isNativeToken } from '~/utils';
import { NETWORK } from '~/types';

import { ERC20_TOKEN_ABI } from '~/abi';

interface Props {
  amount?: bigint;
  allowanceMin?: bigint;
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

  enabled,
}: Props) => {
  const { network } = useParams();
  const { selectedNetwork, isEvm, isFpass } = useNetwork();

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
    !isFpass &&
    !isNativeToken({ address: tokenAddress, network: currentNetwork });

  const { isLoading: isReadLoading, refetch } = useContractRead({
    address: tokenAddress,
    abi: ERC20_TOKEN_ABI,
    functionName: 'allowance',
    chainId,
    args: [walletAddress, spender],
    enabled: internalEnabled,

    onSuccess: (data: string) => {
      if (
        currentNetwork === NETWORK.EVM_SIDECHAIN &&
        tokenAddress === getWrappedTokenAddress(currentNetwork)
      ) {
        return setAllowance(true);
      }
      return setAllowance(BigInt(data || 0) >= (allowanceMin || 0n));
    },
    onError: () => setAllowance(false),
  });

  const { isFetching: isPrepareLoading, config } = usePrepareContractWrite({
    address: tokenAddress,
    abi: ERC20_TOKEN_ABI,
    functionName: 'approve',
    chainId,
    account: walletAddress as Address,
    args: [spender, amount],
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
    estimateFee: async () => {},
  };
};
