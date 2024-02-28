import { useParams } from 'react-router-dom';
import { Abi, Address } from 'viem';
import { useContractRead } from 'wagmi';

import { UNITROLLER_ADDRESS } from '~/constants';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { getNetworkFull } from '~/utils';
import { NETWORK } from '~/types';

import { COMPTROLLER_ABI } from '~/abi/comptroller';

/**
 * @description Get Markets metadata
 */
interface Props {
  mTokenAddress: Address;
}
export const useGetMarkets = ({ mTokenAddress }: Props) => {
  const { network } = useParams();
  const { selectedNetwork, isEvm } = useNetwork();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const chainId = useNetworkId(currentNetwork);

  const { data, refetch } = useContractRead({
    address: UNITROLLER_ADDRESS[NETWORK.THE_ROOT_NETWORK] as Address,
    abi: COMPTROLLER_ABI as Abi,
    functionName: 'markets',
    chainId,

    args: [mTokenAddress],
    staleTime: 1000 * 3,
    enabled: !!chainId && isEvm && !!mTokenAddress,
  });

  const collateralFactorsMantissa = data?.[1];

  return {
    marketMetadata: {
      address: mTokenAddress,
      collateralFactorsMantissa,
    },
    refetch,
  };
};
