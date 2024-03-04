import { useParams } from 'react-router-dom';
import { Abi, Address } from 'viem';
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

/**
 * @description All registered markets
 */
export const useGetAllMarkets_dummy = () => {
  const markets = [
    {
      address: '0x930AF8991311BF82736Fe5C1b33949fE79897367',
      decimals: 8,
      underlyingAsset: '0xcCcCCCCc00000864000000000000000000000000',
      underlyingDecimals: 6,
      symbol: 'mUSDC',
      supplyRatePerBlock: 0,
      borrowRatePerBlock: 0,
      supplyApy: 0,
      borrowApy: 0,
      totalReserves: 151275n,
      totalBorrows: 0n,
      totalSupply: 22989545730n,
      cash: 4749251n,
      initialExchangeRateMantissa: 200000000000000n,
      reserveFactorMantissa: 100000000000000000n,
      interestRateModel: '0x5a8Db720FB265B5D3bbD22Aa345a027822754494',
      blocksPerYear: 7884000,
      kink: 0.8,
      multiplierPerBlock: 6341958396,
      jumpMultiplierPerBlock: 138254693049,
      utilizationRate: 0,
      collateralFactorsMantissa: 800000000000000000n,
    },
    {
      address: '0x6a6a1ccd6af1f9b01E3706f36caa3D254Ae900D7',
      decimals: 8,
      underlyingAsset: '0xCCCCcCCc00000002000000000000000000000000',
      underlyingDecimals: 6,
      symbol: 'mXRP',
      supplyRatePerBlock: 164468067,
      borrowRatePerBlock: 2422220928,
      supplyApy: 12.975049692178775,
      borrowApy: 192.79790589999735,
      totalReserves: 5n,
      totalBorrows: 8487464n,
      totalSupply: 500000005000n,
      cash: 91512563n,
      initialExchangeRateMantissa: 200000000000000n,
      reserveFactorMantissa: 200000000000000000n,
      interestRateModel: '0xfd0852961469640459BE31bC06b414395F56a629',
      blocksPerYear: 7884000,
      kink: 0.8,
      multiplierPerBlock: 28538812785,
      jumpMultiplierPerBlock: 507356671740,
      utilizationRate: 0.0848746213275833,
      collateralFactorsMantissa: 700000000000000000n,
    },
  ];
  const underlyingAssets = markets.map(market => market.underlyingAsset) || [];
  const { userTokenBalances } = useUserTokenBalances({ addresses: underlyingAssets });

  const marketWithToken = markets.map(market => {
    const token = userTokenBalances?.find(t => t.address === market.underlyingAsset);
    return {
      ...market,
      address: market.address,
      symbol: market.symbol,

      price: token?.price,

      underlyingSymbol: token?.symbol,
      underlyingImage: token?.image,
      underlyingBalance: token?.balance,
    } as IMarketWithToken;
  });

  return {
    markets: marketWithToken,
    refetch: () => {},
  };
};

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

  const marketAddrs = (marketsData as Array<string>)?.map((m: string) => m);
  // console.log(marketAddrs);

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
    enabled: !!marketsData && !!chainId && isEvm && !!marketAddrs,
  });
  const symbols = (symbolsData?.map(d => d.result) || []) as string[];

  const { data: metadataAll } = useContractRead({
    address: MOAILENS_ADDRESS[NETWORK.THE_ROOT_NETWORK] as Address,
    abi: MOAI_LENS_ABI as Abi,
    functionName: 'cTokenMetadataAll',
    chainId,
    args: [marketAddrs],
    staleTime: 1000 * 3,
    enabled: !!chainId && isEvm,
  });
  const metadataList = (metadataAll as Array<IMTokenMetadata>)?.map((m: IMTokenMetadata) => m);

  // console.log('metadataAll', metadataAll);

  const underlyings = (metadataList?.map(d => d.underlyingAssetAddress) || []) as Address[];
  const underlyingDecimals = (metadataList?.map(d => Number(d.underlyingDecimals)) ||
    []) as number[];

  const supplyRatePerBlocks = (metadataList?.map(d => Number(d.supplyRatePerBlock)) ||
    []) as number[];

  const borrowRatePerBlocks = (metadataList?.map(d => Number(d.borrowRatePerBlock)) ||
    []) as number[];

  const totalReserves = (metadataList?.map(d => d.totalReserves) || []) as bigint[];
  const totalBorrows = (metadataList?.map(d => d.totalBorrows) || []) as bigint[];
  const cashes = (metadataList?.map(d => d.totalCash) || []) as bigint[];
  const reserveFactorMantissa = (metadataList?.map(d => d.reserveFactorMantissa) || []) as bigint[];
  const totalSupply = (metadataList?.map(d => d.totalSupply) || []) as bigint[];
  const collateralFactorsMantissa = (metadataList?.map(d => d.collateralFactorMantissa) ||
    []) as bigint[];

  // const { data: interestRateModelData } = useContractReads({
  //   contracts: marketAddrs?.flatMap(address => [
  //     {
  //       address: address as Address,
  //       abi: MTOKEN_ABI as Abi,
  //       functionName: 'interestRateModel',
  //       chainId,
  //     },
  //   ]),
  //   staleTime: 1000 * 3,
  //   watch: true,
  //   enabled:   !!marketsData && !!chainId && isEvm,
  // });
  // const interestRateModels = (interestRateModelData?.map(d => d.result) || []) as Address[];

  // /********************************************
  //  * Interest rate model related fields
  //  *********************************************/
  // const { data: blocksPerYearData } = useContractReads({
  //   contracts: interestRateModels?.flatMap(address => [
  //     {
  //       address: address as Address,
  //       abi: IRATE_MODEL_ABI as Abi,
  //       functionName: 'blocksPerYear',
  //       chainId,
  //     },
  //   ]),
  //   staleTime: 1000 * 3,
  //   enabled:
  //     !!marketsData && !!chainId && isEvm && interestRateModels && interestRateModels.length > 0,
  // });
  // const blocksPerYear = (blocksPerYearData?.map(d => Number(d.result)) || []) as number[];

  // const { data: kinkData } = useContractReads({
  //   contracts: interestRateModels?.flatMap(address => [
  //     {
  //       address: address as Address,
  //       abi: IRATE_MODEL_ABI as Abi,
  //       functionName: 'kink',
  //       chainId,
  //     },
  //   ]),
  //   staleTime: 1000 * 3,
  //   enabled:
  //     !!marketsData && !!chainId && isEvm && interestRateModels && interestRateModels.length > 0,
  // });
  // const kink = (kinkData?.map(d => Number(formatEther((d.result as bigint) || 0n))) ||
  //   []) as number[];

  // const { data: multiplierPerBlockData } = useContractReads({
  //   contracts: interestRateModels?.flatMap(address => [
  //     {
  //       address: address as Address,
  //       abi: IRATE_MODEL_ABI as Abi,
  //       functionName: 'multiplierPerBlock',
  //       chainId,
  //     },
  //   ]),
  //   staleTime: 1000 * 3,
  //   watch: true,
  //   enabled:
  //     !!marketsData && !!chainId && isEvm && interestRateModels && interestRateModels.length > 0,
  // });
  // const multiplierPerBlock = (multiplierPerBlockData?.map(d => d.result) || []) as number[];

  // const { data: jumpMultiplierPerBlockData } = useContractReads({
  //   contracts: interestRateModels?.flatMap(address => [
  //     {
  //       address: address as Address,
  //       abi: IRATE_MODEL_ABI as Abi,
  //       functionName: 'jumpMultiplierPerBlock',
  //       chainId,
  //     },
  //   ]),
  //   staleTime: 1000 * 3,
  //   watch: true,
  //   enabled:
  //     !!marketsData && !!chainId && isEvm && interestRateModels && interestRateModels.length > 0,
  // });
  // const jumpMultiplierPerBlock = (jumpMultiplierPerBlockData?.map(d => d.result) || []) as number[];

  // const { data: utilizationRateData } = useContractReads({
  //   contracts: interestRateModels?.flatMap((address, i) => [
  //     {
  //       address: address as Address,
  //       abi: IRATE_MODEL_ABI as Abi,
  //       functionName: 'utilizationRate',
  //       args: [cashes[i], totalBorrows[i], totalReserves[i]] as [bigint, bigint, bigint],
  //       chainId,
  //     },
  //   ]),
  //   staleTime: 1000 * 3,
  //   watch: true,
  //   enabled:
  //     !!marketsData && !!chainId && isEvm && interestRateModels && interestRateModels.length > 0,
  // });
  // const utilizationRate = (utilizationRateData?.map(d =>
  //   Number(formatEther((d.result as bigint) || 0n))
  // ) || []) as number[];

  const blocksPerYear = 7884000;
  const blocksPerDay = blocksPerYear / 365;

  const markets: IMarket[] = (marketAddrs as Array<string>)?.map((m: string, i: number) => {
    return {
      address: m as Address,
      decimals: 8,
      underlyingAsset: underlyings[i],
      underlyingDecimals: underlyingDecimals[i] ?? 18,
      symbol: symbols[i],
      supplyRatePerBlock: supplyRatePerBlocks[i] ?? 0,
      borrowRatePerBlock: borrowRatePerBlocks[i] ?? 0,

      supplyApy:
        (Math.pow(((supplyRatePerBlocks[i] ?? 0) * blocksPerDay) / 1e18 + 1, 365) - 1) * 100,
      borrowApy:
        (Math.pow(((borrowRatePerBlocks[i] ?? 0) * blocksPerDay) / 1e18 + 1, 365) - 1) * 100,

      totalReserves: totalReserves[i] ?? 0n,
      totalBorrows: totalBorrows[i] ?? 0n,
      cash: cashes[i] ?? 0n,

      initialExchangeRateMantissa: 200000000000000n,
      reserveFactorMantissa: reserveFactorMantissa[i] ?? 0n,

      totalSupply: totalSupply[i] ?? 0,

      blocksPerYear,
      collateralFactorsMantissa: collateralFactorsMantissa[i] ?? 0n,
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

      price: token?.price,

      underlyingSymbol: token?.symbol,
      underlyingImage: token?.image,
      underlyingBalance: token?.balance,
    } as IMarketWithToken;
  });

  // TODO: refetchAll
  return {
    markets: marketWithToken,
    refetch,
  };
};
