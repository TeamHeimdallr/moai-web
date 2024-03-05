import { useParams } from 'react-router-dom';
import { Abi, Address, formatUnits } from 'viem';
import { useContractRead } from 'wagmi';

import { MOAILENS_ADDRESS, UNITROLLER_ADDRESS } from '~/constants';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkFull } from '~/utils';
import { NETWORK } from '~/types';
import { IMTokenMetadata } from '~/types/lending';

import { COMPTROLLER_ABI } from '~/abi/comptroller';
import { MOAI_LENS_ABI } from '~/abi/moai-lens';

/**
 * @description Get Maximum borrow power in USD
 */

export const useGetMaxBorrowPower = () => {
  const { network } = useParams();
  const { selectedNetwork, isEvm, isFpass } = useNetwork();
  const { evm, fpass } = useConnectedWallet();
  const { address: walletAddress } = isFpass ? fpass : evm;

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const chainId = useNetworkId(currentNetwork);

  const { data: marketsData, refetch } = useContractRead({
    address: UNITROLLER_ADDRESS[NETWORK.THE_ROOT_NETWORK] as Address,
    abi: COMPTROLLER_ABI as Abi,
    functionName: 'getAssetsIn',
    chainId,

    args: [walletAddress],
    staleTime: 1000 * 3,
    enabled: !!chainId && isEvm && !!walletAddress,
  });

  const marketAddrs = (marketsData as Array<string>)?.map((m: string) => m);

  const { data: balanceData } = useContractRead({
    address: MOAILENS_ADDRESS[NETWORK.THE_ROOT_NETWORK] as Address,
    abi: MOAI_LENS_ABI as Abi,
    functionName: 'cTokenBalancesAll',
    chainId,

    args: [marketAddrs, walletAddress],
    staleTime: 1000 * 3,
    enabled: !!chainId && isEvm && !!marketAddrs && !!walletAddress,
  });
  const balances = balanceData as Array<bigint>;

  const { data: metadataAllData } = useContractRead({
    address: MOAILENS_ADDRESS[NETWORK.THE_ROOT_NETWORK] as Address,
    abi: MOAI_LENS_ABI as Abi,
    functionName: 'cTokenMetadataAll',
    chainId,

    args: [marketAddrs],
    staleTime: 1000 * 3,
    enabled: !!chainId && isEvm && !!marketAddrs,
  });

  const metadataAll = metadataAllData as Array<IMTokenMetadata>;

  const { data: underlyingPriceAllData } = useContractRead({
    address: MOAILENS_ADDRESS[NETWORK.THE_ROOT_NETWORK] as Address,
    abi: MOAI_LENS_ABI as Abi,
    functionName: 'cTokenUnderlyingPriceAll',
    chainId,

    args: [marketAddrs],
    staleTime: 1000 * 3,
    enabled: !!chainId && isEvm && !!marketAddrs,
  });

  const underlyingPriceAll = underlyingPriceAllData as Array<bigint>;

  const maximumBorrowPower = balances?.reduce((acc, b, i) => {
    const decimals = Number(metadataAll?.[i]?.underlyingDecimals || 0);
    const balanceOfUnderlying = b?.['balanceOfUnderlying'] || 0n;
    const price = Number(
      formatUnits(underlyingPriceAll?.[i]?.['underlyingPrice'] || 0n, 36 - decimals)
    );
    const collateralValue = Number(formatUnits(balanceOfUnderlying, decimals)) * price;
    const collateralFactor = Number(
      formatUnits(metadataAll?.[i]?.collateralFactorMantissa || 0n, 18)
    );

    const borrowPower = collateralValue * collateralFactor;
    return acc + borrowPower;
  }, 0);

  return {
    maximumBorrowPower,
    refetch,
  };
};
