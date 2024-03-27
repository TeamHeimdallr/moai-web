import { useParams } from 'react-router-dom';
import { Abi, Address } from 'viem';
import { useContractRead } from 'wagmi';

import { UNITROLLER_ADDRESS } from '~/constants';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkFull } from '~/utils';
import { NETWORK } from '~/types';

import { COMPTROLLER_ABI } from '~/abi/comptroller';

/**
 * @description Get Enabled Markets
 */
export const useGetAssetsIn = () => {
  const { network } = useParams();
  const { selectedNetwork, isEvm, isFpass } = useNetwork();
  const { evm, fpass } = useConnectedWallet();
  const walletAddress = isFpass ? fpass.address : evm?.address || '';

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const chainId = useNetworkId(currentNetwork);

  const { data, refetch } = useContractRead({
    address: UNITROLLER_ADDRESS[NETWORK.THE_ROOT_NETWORK] as Address,
    abi: COMPTROLLER_ABI as Abi,
    functionName: 'getAssetsIn',
    chainId,

    args: [walletAddress],
    staleTime: 1000 * 3,
    enabled: !!chainId && isEvm && !!walletAddress,
  });

  const refetchGetAssetsIn = () => {
    if (!walletAddress) return;
    refetch();
  };

  return {
    enteredMarkets: data as string[] | undefined,
    refetch: refetchGetAssetsIn,
  };
};
