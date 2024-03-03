import { useParams } from 'react-router-dom';
import { Abi, Address } from 'viem';
import { useContractRead } from 'wagmi';

import { MOAILENS_ADDRESS } from '~/constants';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { getNetworkFull } from '~/utils';
import { NETWORK } from '~/types';
import { IMTokenMetadata } from '~/types/lending';

import { MOAI_LENS_ABI } from '~/abi/moai-lens';

/**
 * @description mToken's metadata
 */
interface Props {
  mTokenAddress: Address;
  enabled?: boolean;
}
export const useGetMTokenMetadata = ({ mTokenAddress, enabled }: Props) => {
  const { network } = useParams();
  const { selectedNetwork, isEvm } = useNetwork();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const chainId = useNetworkId(currentNetwork);

  const { data: metaData, refetch: metaDataRefetch } = useContractRead({
    address: MOAILENS_ADDRESS[NETWORK.THE_ROOT_NETWORK] as Address,
    abi: MOAI_LENS_ABI as Abi,
    functionName: 'cTokenMetadata',
    chainId,

    args: [mTokenAddress],
    staleTime: 1000 * 3,
    enabled: !!chainId && isEvm && !!mTokenAddress && enabled,
  });

  const mTokenMetadata = {
    mToken: mTokenAddress,
    exchangeRateCurrent: metaData?.['exchangeRateCurrent'] ?? 0n,
    supplyRatePerBlock: metaData?.['supplyRatePerBlock'] ?? 0n,
    borrowRatePerBlock: metaData?.['borrowRatePerBlock'] ?? 0n,
    reserveFactorMantissa: metaData?.['reserveFactorMantissa'] ?? 0n,
    totalBorrows: metaData?.['totalBorrows'] ?? 0n,
    totalReserves: metaData?.['totalReserves'] ?? 0n,
    totalSupply: metaData?.['totalSupply'] ?? 0n,
    totalCash: metaData?.['totalCash'] ?? 0n,
    isListed: metaData?.['isListed'] ?? false,
    collateralFactorMantissa: metaData?.['collateralFactorMantissa'] ?? 0n,
    underlyingAssetAddress: metaData?.['underlyingAssetAddress'] ?? '0x0',
    cTokenDecimals: metaData?.['cTokenDecimals'] ?? 0n,
    underlyingDecimals: metaData?.['underlyingDecimals'] ?? 0n,
    compSupplySpeed: metaData?.['compSupplySpeed'] ?? 0n,
    compBorrowSpeed: metaData?.['compBorrowSpeed'] ?? 0n,
    borrowCap: metaData?.['borrowCap'] ?? 0n,
  } as IMTokenMetadata;

  const refetch = () => {
    metaDataRefetch();
  };

  return {
    mTokenMetadata,
    refetch,
  };
};
