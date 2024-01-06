import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { BigNumber } from 'ethers';
import { Address, formatUnits, parseEther } from 'viem';
import {
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  usePublicClient,
  useWaitForTransaction,
} from 'wagmi';

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

  const publicClient = usePublicClient();

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
      return setAllowance(BigInt(data || 0) > (allowanceMin || 0n));
    },
    onError: () => setAllowance(false),
  });

  const { config } = usePrepareContractWrite({
    address: tokenAddress,
    abi: ERC20_TOKEN_ABI,
    functionName: 'approve',
    chainId,
    account: walletAddress as Address,
    args: [spender, amount],
    enabled: internalEnabled,
  });

  const { data, isLoading, writeAsync } = useContractWrite(config);
  const { isSuccess, isLoading: isTxLoading } = useWaitForTransaction({
    hash: data?.hash,
    enabled: !!data?.hash,
  });

  const allow = async () => {
    if (!isEvm) return;

    await writeAsync?.();
  };

  const getEstimatedGas = async () => {
    if (!isEvm || isFpass || !tokenAddress) return;

    const feeHistory = await publicClient.getFeeHistory({
      blockCount: 2,
      rewardPercentiles: [25, 75],
    });

    const gas = await publicClient.estimateContractGas({
      address: tokenAddress as Address,
      abi: ERC20_TOKEN_ABI,
      functionName: 'approve',
      account: walletAddress as Address,
      args: [spender, parseEther(Number.MAX_SAFE_INTEGER.toString())],
    });

    const maxFeePerGas = feeHistory.baseFeePerGas[0];
    const gasCostInEth = BigNumber.from(gas).mul(Number(maxFeePerGas).toFixed());
    const remainder = gasCostInEth.mod(10 ** 12);
    const gasCostInXRP = gasCostInEth.div(10 ** 12).add(remainder.gt(0) ? 1 : 0);
    const gasCostInXrpPriority = (gasCostInXRP.toBigInt() * 15n) / 10n;

    const formatted = Number(formatUnits(gasCostInXrpPriority, 6));
    return formatted;
  };

  return {
    isLoading: isLoading || isReadLoading || isTxLoading,
    isSuccess,
    allowance:
      (isConnected && allowance) ||
      isNativeToken({ address: tokenAddress, network: currentNetwork }),
    refetch,
    allow,
    estimateFee: async () => {
      // TODO: fee proxy
      if (currentNetwork === NETWORK.THE_ROOT_NETWORK) return getEstimatedGas();

      // TODO: handle evm sidechain
      return 0.0005;
    },
  };
};
