import { useParams } from 'react-router-dom';
import { Abi, Address } from 'viem';
import { useContractRead } from 'wagmi';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { getNetworkFull } from '~/utils';

import { COMPOSABLE_STABLE_POOL_ABI } from '~/abi/composable-stable-pool';

interface Props {
  poolAddress: Address;
  enabled?: boolean;
}
export const useGetActualSupplyStable = ({ poolAddress, enabled }: Props) => {
  const { network } = useParams();
  const { selectedNetwork } = useNetwork();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const chainId = useNetworkId(currentNetwork);

  const { data: actualSupply } = useContractRead({
    address: poolAddress as Address,
    abi: COMPOSABLE_STABLE_POOL_ABI as Abi,
    functionName: 'getActualSupply',
    args: [],
    chainId,
    staleTime: 1000 * 3,
    enabled: !!enabled,
  });

  return {
    actualSupply,
  };
};
