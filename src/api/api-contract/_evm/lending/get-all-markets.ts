import { useParams } from 'react-router-dom';
import { Abi, Address, formatUnits } from 'viem';
import { useContractRead, useContractReads } from 'wagmi';

import { MOAILENS_ADDRESS, UNITROLLER_ADDRESS } from '~/constants';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { getNetworkFull } from '~/utils';
import { NETWORK } from '~/types';
import { IMarket, IMarketWithToken, IMTokenMetadata } from '~/types/lending';

import { COMPTROLLER_ABI } from '~/abi/comptroller';
import { MOAI_LENS_ABI } from '~/abi/moai-lens';
import { MTOKEN_ABI } from '~/abi/mtoken';

import { useUserTokenBalances } from '../balance/user-token-balances';

interface IPriceData {
  cToken: Address;
  underlyingPrice: bigint;
}
export const useGetAllMarkets = () => {
  const { network } = useParams();
  const { selectedNetwork, isEvm } = useNetwork();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const chainId = useNetworkId(currentNetwork);

  const { data: marketsData, refetch } = useContractRead({
    address: UNITROLLER_ADDRESS[NETWORK.THE_ROOT_NETWORK] as Address,
    abi: COMPTROLLER_ABI as Abi,
    functionName: 'getAllMarkets',
    chainId,

    staleTime: 1000 * 3,
    enabled: !!chainId && isEvm,
  });
  const marketAddrs = (marketsData as string[])?.map((m: string) => m) as string[] | undefined;

  const { data: symbolsData } = useContractReads({
    contracts: marketAddrs?.flatMap(address => [
      {
        address: address as Address,
        abi: MTOKEN_ABI as Abi,
        functionName: 'symbol',
        chainId,
      },
    ]),
    staleTime: 1000 * 3,
    enabled: !!marketsData && !!chainId && isEvm && !!marketAddrs && marketAddrs.length > 0,
  });
  const symbols = symbolsData?.map(d => d.result) as string[] | undefined;

  const { data: pricesData } = useContractRead({
    address: MOAILENS_ADDRESS[NETWORK.THE_ROOT_NETWORK] as Address,
    abi: MOAI_LENS_ABI as Abi,
    functionName: 'cTokenUnderlyingPriceAll',
    chainId,

    args: [marketAddrs],
    staleTime: 1000 * 3,
    enabled: !!chainId && isEvm && !!marketAddrs && marketAddrs.length > 0,
  });
  const prices = pricesData as IPriceData[] | undefined;

  const { data: metadataAll } = useContractRead({
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

  const underlyings = metadataList?.map(d => d.underlyingAssetAddress) as Address[] | undefined;
  const underlyingDecimals = metadataList?.map(d => Number(d.underlyingDecimals)) as
    | number[]
    | undefined;
  const supplyRatePerBlocks = metadataList?.map(d => Number(d.supplyRatePerBlock)) as
    | number[]
    | undefined;
  const borrowRatePerBlocks = metadataList?.map(d => Number(d.borrowRatePerBlock)) as
    | number[]
    | undefined;

  const totalReserves = metadataList?.map(d => d.totalReserves) as bigint[] | undefined;
  const totalBorrows = metadataList?.map(d => d.totalBorrows) as bigint[] | undefined;

  const cashes = metadataList?.map(d => d.totalCash) as bigint[] | undefined;

  const reserveFactorMantissa = metadataList?.map(d => d.reserveFactorMantissa) as
    | bigint[]
    | undefined;

  const totalSupply = metadataList?.map(d => d.totalSupply) as bigint[] | undefined;

  const collateralFactorsMantissa = (metadataList?.map(d => d.collateralFactorMantissa) ||
    []) as bigint[];

  const blocksPerYear = 7884000; // TODO: Futureverse only
  const blocksPerDay = blocksPerYear / 365;

  const markets: IMarket[] | undefined = marketAddrs?.map((m: string, i: number) => {
    return {
      address: m as Address,
      decimals: 8,
      underlyingAsset: underlyings?.[i] || '0x0',
      underlyingDecimals: underlyingDecimals?.[i] || 18,
      symbol: symbols?.[i] || '',
      supplyRatePerBlock: supplyRatePerBlocks?.[i] || 0,
      borrowRatePerBlock: borrowRatePerBlocks?.[i] || 0,

      supplyApy:
        (Math.pow(((supplyRatePerBlocks?.[i] || 0) * blocksPerDay) / 1e18 + 1, 365) - 1) * 100,
      borrowApy:
        (Math.pow(((borrowRatePerBlocks?.[i] || 0) * blocksPerDay) / 1e18 + 1, 365) - 1) * 100,

      totalReserves: totalReserves?.[i] || 0n,
      totalBorrows: totalBorrows?.[i] || 0n,
      cash: cashes?.[i] || 0n,

      initialExchangeRateMantissa: 200000000000000n,
      reserveFactorMantissa: reserveFactorMantissa?.[i] || 0n,

      totalSupply: totalSupply?.[i] || 0n,

      blocksPerYear,
      collateralFactorsMantissa: collateralFactorsMantissa?.[i] || 0n,

      price: Number(
        formatUnits(prices?.[i]?.['underlyingPrice'] || 0n, 36 - (underlyingDecimals?.[i] || 18))
      ),
    };
  });

  const underlyingAssets = markets?.map(market => market?.underlyingAsset) || [];
  const { userTokenBalances } = useUserTokenBalances({ addresses: underlyingAssets });

  const marketWithToken = markets?.map(market => {
    const token = userTokenBalances?.find(t => t.address === market?.underlyingAsset);
    return {
      ...market,
      address: market?.address,
      symbol: market?.symbol,

      underlyingSymbol: token?.symbol,
      underlyingImage: token?.image,
      underlyingBalance: token?.balance,
    } as IMarketWithToken;
  });

  return {
    markets: marketWithToken,
    refetch,
  };
};
