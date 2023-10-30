import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Address, encodeFunctionData, parseUnits } from 'viem';
import { useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi';

import { TOKEN_DECIMAL } from '~/constants';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkFull } from '~/utils';

import { ERC20_TOKEN_ABI } from '~/abi';
import { FUTUREPASS_ABI } from '~/abi/futurepass';

interface Props {
  amount?: number;
  allowanceMin?: number;
  spender?: Address;
  tokenAddress?: Address;

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

  const { fpass } = useConnectedWallet();
  const { isConnected, address: walletAddress, signer } = fpass;

  const internalEnabled =
    enabled && !!walletAddress && !!spender && isEvm && isFpass && !!tokenAddress;

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

  const encodedData = internalEnabled
    ? encodeFunctionData({
        abi: ERC20_TOKEN_ABI,
        functionName: 'approve',
        args: [spender, `${parseUnits(`${amount || 0}`, TOKEN_DECIMAL[currentNetwork])}`],
      })
    : '0x0';

  const { isLoading: isPrepareLoading, config } = usePrepareContractWrite({
    address: walletAddress,
    abi: FUTUREPASS_ABI,
    functionName: 'proxyCall',

    account: signer as Address,
    chainId,
    value: BigInt(0),
    args: [1, tokenAddress, BigInt(0), encodedData],
    enabled: internalEnabled,
  });

  const { isLoading, isSuccess, writeAsync } = useContractWrite(config);

  const allow = async () => {
    if (!isEvm || !isFpass) return;

    await writeAsync?.();
  };

  return {
    isLoading: isLoading || isReadLoading || isPrepareLoading,
    isSuccess,
    allowance: isConnected && allowance,
    refetch,
    allow,
  };
};