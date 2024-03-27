import { useParams } from 'react-router-dom';
import { Abi, Address } from 'viem';
import { useContractRead } from 'wagmi';

import { MOAILENS_ADDRESS, UNITROLLER_ADDRESS } from '~/constants';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkFull } from '~/utils';
import { NETWORK } from '~/types';
import { IMTokenMetadata, ISnapshot } from '~/types/lending';

import { COMPTROLLER_ABI } from '~/abi/comptroller';
import { MOAI_LENS_ABI } from '~/abi/moai-lens';

/**
 * @description Get a snapshot of the account's balances, and the cached exchange rate for all markets
 */
export const useUserAccountSnapshotAll = () => {
  const { network } = useParams();
  const { selectedNetwork, isEvm, isFpass } = useNetwork();
  const { evm, fpass } = useConnectedWallet();
  const walletAddress = isFpass ? fpass.address : evm?.address || '';

  const currentNetwork = getNetworkFull(network) || selectedNetwork;
  const chainId = useNetworkId(currentNetwork);

  const { data: marketsData, refetch: refetchMarkets } = useContractRead({
    address: UNITROLLER_ADDRESS[NETWORK.THE_ROOT_NETWORK] as Address,
    abi: COMPTROLLER_ABI as Abi,
    functionName: 'getAllMarkets',
    chainId,

    staleTime: 1000 * 3,
    enabled: !!chainId && isEvm && !!walletAddress,
  });
  const marketAddrs = (marketsData as string[])?.map((m: string) => m) as string[] | undefined;

  const { data: assetsInData } = useContractRead({
    address: UNITROLLER_ADDRESS[NETWORK.THE_ROOT_NETWORK] as Address,
    abi: COMPTROLLER_ABI as Abi,
    functionName: 'getAssetsIn',
    chainId,

    args: [walletAddress],
    staleTime: 1000 * 3,
    enabled: !!chainId && isEvm && !!walletAddress,
  });

  const assetsIn = (assetsInData as string[])?.map((m: string) => m) as string[] | undefined;

  const { data: balanceData, refetch: refetchSnapshots } = useContractRead({
    address: MOAILENS_ADDRESS[NETWORK.THE_ROOT_NETWORK] as Address,
    abi: MOAI_LENS_ABI as Abi,
    functionName: 'cTokenBalancesAll',
    chainId,

    args: [marketAddrs, walletAddress],
    staleTime: 1000 * 3,
    enabled: !!chainId && isEvm && !!walletAddress && !!marketAddrs && marketAddrs.length > 0,
  });
  const balances = balanceData as bigint[] | undefined;

  const { data: metadataAll, refetch: refetchMarketsDetail } = useContractRead({
    address: MOAILENS_ADDRESS[NETWORK.THE_ROOT_NETWORK] as Address,
    abi: MOAI_LENS_ABI as Abi,
    functionName: 'cTokenMetadataAll',
    chainId,
    args: [marketAddrs],
    staleTime: 1000 * 3,
    enabled: !!chainId && isEvm && !!marketAddrs && marketAddrs.length > 0,
  });
  const metadataList = (metadataAll as IMTokenMetadata[])?.map((m: IMTokenMetadata) => m) as
    | IMTokenMetadata[]
    | undefined;

  const accountSnapshots = (balances?.map((d, i) => {
    return {
      error: BigInt(d === undefined),
      mTokenBalance: BigInt(d?.['balanceOf'] || 0),
      borrowBalance: BigInt(d?.['borrowBalanceCurrent'] || 0),
      exchangeRate: BigInt(metadataList?.[i]?.['exchangeRateCurrent'] || 200000000000000n),
      collateralFator: BigInt(metadataList?.[i]?.['collateralFactorMantissa'] || 0),
      mTokenAddress: marketAddrs?.[i] || '0x0',
      isCollateral: assetsIn?.includes(marketAddrs?.[i] || '0x0'),
    };
  }) || []) as ISnapshot[];

  const refetch = () => {
    if (!walletAddress || !marketAddrs || !marketAddrs.length) return;

    refetchMarkets();
    refetchSnapshots();
    refetchMarketsDetail();
  };

  return {
    accountSnapshots,
    refetch,
  };
};
