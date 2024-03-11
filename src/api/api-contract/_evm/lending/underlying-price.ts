import { useParams } from 'react-router-dom';
import { Abi, Address, formatUnits } from 'viem';
import { useContractRead } from 'wagmi';

import { MOAILENS_ADDRESS } from '~/constants';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { getNetworkFull } from '~/utils';
import { NETWORK } from '~/types';

import { MOAI_LENS_ABI } from '~/abi/moai-lens';

/**
 * @description Get mToken underlying asset's oracle price
 */
interface Props {
  mTokenAddress: Address;
}
export const useGetUnderlyingPrice = ({ mTokenAddress }: Props) => {
  const { network } = useParams();
  const { selectedNetwork, isEvm } = useNetwork();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const chainId = useNetworkId(currentNetwork);

  const { data, refetch } = useContractRead({
    address: MOAILENS_ADDRESS[NETWORK.THE_ROOT_NETWORK] as Address,
    abi: MOAI_LENS_ABI as Abi,
    functionName: 'cTokenUnderlyingPrice',
    chainId,

    args: [mTokenAddress],
    staleTime: 1000 * 3,
    enabled: !!chainId && isEvm && !!mTokenAddress,
  });

  const { data: metaData } = useContractRead({
    address: MOAILENS_ADDRESS[NETWORK.THE_ROOT_NETWORK] as Address,
    abi: MOAI_LENS_ABI as Abi,
    functionName: 'cTokenMetadata',
    chainId,

    args: [mTokenAddress],
    staleTime: 1000 * 3,
    enabled: !!chainId && isEvm && !!mTokenAddress,
  });

  const priceRaw = (data?.['underlyingPrice'] || 0n) as bigint;
  const decimals = Number(metaData?.['underlyingDecimals'] || 0n) as number;
  const price = priceRaw ? formatUnits(priceRaw, 36 - decimals) : undefined;

  return {
    priceRaw,
    price,
    refetch,
  };
};
