import { useParams } from 'react-router-dom';
import { Abi, Address, formatUnits } from 'viem';
import { useContractRead } from 'wagmi';

import { UNITROLLER_ADDRESS } from '~/constants';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { getNetworkFull } from '~/utils';
import { NETWORK } from '~/types';

import { COMPTROLLER_ABI } from '~/abi/comptroller';

interface Props {
  marketAddress: Address;
  underlyingDecimals: number;
}
export const useGetSupplyCap = ({ marketAddress, underlyingDecimals }: Props) => {
  const { network } = useParams();
  const { selectedNetwork, isEvm } = useNetwork();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const chainId = useNetworkId(currentNetwork);

  const { data: supplyCapData, refetch } = useContractRead({
    address: UNITROLLER_ADDRESS[NETWORK.THE_ROOT_NETWORK] as Address,
    abi: COMPTROLLER_ABI as Abi,
    functionName: 'supplyCaps',
    args: [marketAddress],
    chainId,
    staleTime: 1000 * 3,
    enabled: !!chainId && isEvm && !!marketAddress,
  });

  const supplyCapRaw = supplyCapData as bigint;
  const supplyCap = Number(formatUnits(supplyCapRaw ?? 0n, underlyingDecimals || 18));

  return {
    supplyCap,
    supplyCapRaw,
    refetch,
  };
};
