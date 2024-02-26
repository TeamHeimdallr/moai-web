import { useParams } from 'react-router-dom';
import { Abi, Address } from 'viem';
import { useContractRead, useContractReads } from 'wagmi';

import { UNITROLLER_ADDRESS } from '~/constants';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkFull } from '~/utils';
import { NETWORK } from '~/types';
import { ISnapshot } from '~/types/lending';

import { COMPTROLLER_ABI } from '~/abi/comptroller';
import { MTOKEN_ABI } from '~/abi/mtoken';

/**
 * @description Get a snapshot of the account's balances, and the cached exchange rate for all markets
 */
export const useUserAccountSnapshotAll = () => {
  const { network } = useParams();
  const { selectedNetwork, isEvm, isFpass } = useNetwork();
  const { evm, fpass } = useConnectedWallet();
  const { address: walletAddress } = isFpass ? fpass : evm;

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const chainId = useNetworkId(currentNetwork);

  const { data: marketsData, refetch: refetchMarkets } = useContractRead({
    address: UNITROLLER_ADDRESS[NETWORK.THE_ROOT_NETWORK] as Address,
    abi: COMPTROLLER_ABI as Abi,
    functionName: 'getAllMarkets',
    chainId,

    staleTime: 1000 * 3,
    enabled: !!chainId && isEvm && !!walletAddress,
  });

  const marketAddrs = (marketsData as Array<string>)?.map((m: string) => m);

  const { data: accountSnapshotsData, refetch: refetchSnapshots } = useContractReads({
    contracts: marketAddrs?.flatMap(address => [
      {
        address: address as Address,
        abi: MTOKEN_ABI as Abi,
        functionName: 'getAccountSnapshot',
        chainId,
        args: [walletAddress],
      },
    ]),
    staleTime: 1000 * 3,
    enabled: !!marketsData && !!chainId && isEvm && !!marketAddrs && !!walletAddress,
  });

  const { data: marketsDetailData, refetch: refetchMarketsDetail } = useContractReads({
    contracts: marketAddrs?.flatMap(address => [
      {
        address: UNITROLLER_ADDRESS[NETWORK.THE_ROOT_NETWORK] as Address,
        abi: COMPTROLLER_ABI as Abi,
        functionName: 'markets',
        chainId,
        args: [address],
      },
    ]),
    staleTime: 1000 * 3,
    enabled: !!marketsData && !!chainId && isEvm && !!marketAddrs,
  });

  const collateralFactorsMantissa = (marketsDetailData?.map(d => {
    const r = d.result;
    return r?.[1];
  }) || []) as bigint[];

  const accountSnapshots = (accountSnapshotsData?.map((d, i) => {
    return {
      error: BigInt(d.result?.[0]),
      mTokenBalance: BigInt(d.result?.[1]),
      borrowBalance: BigInt(d.result?.[2]),
      exchangeRate: BigInt(d.result?.[3]),
      collateralFator: collateralFactorsMantissa[i],
    };
  }) || []) as ISnapshot[];

  const refetch = () => {
    refetchMarkets();
    refetchSnapshots();
    refetchMarketsDetail();
  };

  return {
    accountSnapshots,
    refetch,
  };
};
