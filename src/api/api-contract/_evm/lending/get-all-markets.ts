import { useParams } from 'react-router-dom';
import { Abi, Address, formatEther } from 'viem';
import { useContractRead, useContractReads } from 'wagmi';

import { UNITROLLER_ADDRESS } from '~/constants';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { getNetworkFull } from '~/utils';
import { NETWORK } from '~/types';
import { IMarket, IMarketWithToken } from '~/types/lending';

import { ERC20_TOKEN_ABI } from '~/abi';
import { COMPTROLLER_ABI } from '~/abi/comptroller';
import { IRATE_MODEL_ABI } from '~/abi/interest-rate-model';
import { MTOKEN_ABI } from '~/abi/mtoken';

import { useUserTokenBalances } from '../balance/user-token-balances';

/**
 * @description All registered markets
 */
export const useGetAllMarkets = () => {
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
    },
    {
      address: '0x6a6a1ccd6af1f9b01E3706f36caa3D254Ae900D7',
      decimals: 8,
      underlyingAsset: '0xCCCCcCCc00000002000000000000000000000000',
      underlyingDecimals: 6,
      symbol: 'mXRP',
      supplyRatePerBlock: 164468067,
      borrowRatePerBlock: 2422220928,
      supplyApy: 0.12975049692178775,
      borrowApy: 1.9279790589999735,
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

export const useGetAllMarkets_temp = () => {
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

  const { data: underlyingsData } = useContractReads({
    contracts: marketAddrs?.flatMap(address => [
      {
        address: address as Address,
        abi: MTOKEN_ABI as Abi,
        functionName: 'underlying',
        chainId,
      },
    ]),
    staleTime: 1000 * 3,
    enabled: !!marketsData && !!chainId && isEvm,
  });
  const underlyings = (underlyingsData?.map(d => d.result) || []) as Address[];

  const { data: underlyingDecimalsData } = useContractReads({
    contracts: underlyings?.flatMap(address => [
      {
        address: address as Address,
        abi: ERC20_TOKEN_ABI as Abi,
        functionName: 'decimals',
        chainId,
      },
    ]),
    staleTime: 1000 * 3,
    enabled: !!marketsData && !!chainId && isEvm && underlyings && underlyings.length > 0,
  });
  const underlyingDecimals = (underlyingDecimalsData?.map(d => d.result) || []) as number[];

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
    enabled: !!marketsData && !!chainId && isEvm,
  });
  const symbols = (symbolsData?.map(d => d.result) || []) as string[];

  const { data: supplyRatePerBlockData } = useContractReads({
    contracts: marketAddrs?.flatMap(address => [
      {
        address: address as Address,
        abi: MTOKEN_ABI as Abi,
        functionName: 'supplyRatePerBlock',
        chainId,
      },
    ]),
    staleTime: 1000 * 3,
    enabled: !!marketsData && !!chainId && isEvm,
  });
  const supplyRatePerBlocks = (supplyRatePerBlockData?.map(d => Number(d.result)) ||
    []) as number[];

  const { data: borrowRatePerBlockData } = useContractReads({
    contracts: marketAddrs?.flatMap(address => [
      {
        address: address as Address,
        abi: MTOKEN_ABI as Abi,
        functionName: 'borrowRatePerBlock',
        chainId,
      },
    ]),
    staleTime: 1000 * 3,
    enabled: !!marketsData && !!chainId && isEvm,
  });
  const borrowRatePerBlocks = (borrowRatePerBlockData?.map(d => Number(d.result)) ||
    []) as number[];

  const { data: totalReservesData } = useContractReads({
    contracts: marketAddrs?.flatMap(address => [
      {
        address: address as Address,
        abi: MTOKEN_ABI as Abi,
        functionName: 'totalReserves',
        chainId,
      },
    ]),
    staleTime: 1000 * 3,
    enabled: !!marketsData && !!chainId && isEvm,
  });
  const totalReserves = (totalReservesData?.map(d => d.result) || []) as bigint[];

  const { data: totalBorrowsData } = useContractReads({
    contracts: marketAddrs?.flatMap(address => [
      {
        address: address as Address,
        abi: MTOKEN_ABI as Abi,
        functionName: 'totalBorrows',
        chainId,
      },
    ]),
    staleTime: 1000 * 3,
    enabled: !!marketsData && !!chainId && isEvm,
  });
  const totalBorrows = (totalBorrowsData?.map(d => d.result) || []) as bigint[];

  const { data: cashData } = useContractReads({
    contracts: marketAddrs?.flatMap(address => [
      {
        address: address as Address,
        abi: MTOKEN_ABI as Abi,
        functionName: 'getCash',
        chainId,
      },
    ]),
    staleTime: 1000 * 3,
    enabled: !!marketsData && !!chainId && isEvm,
  });
  const cashes = (cashData?.map(d => d.result) || []) as bigint[];

  const { data: reserveFactorMantissaData } = useContractReads({
    contracts: marketAddrs?.flatMap(address => [
      {
        address: address as Address,
        abi: MTOKEN_ABI as Abi,
        functionName: 'reserveFactorMantissa',
        chainId,
      },
    ]),
    staleTime: 1000 * 3,
    enabled: !!marketsData && !!chainId && isEvm,
  });
  const reserveFactorMantissa = (reserveFactorMantissaData?.map(d => d.result) || []) as bigint[];

  const { data: totalSupplyData } = useContractReads({
    contracts: marketAddrs?.flatMap(address => [
      {
        address: address as Address,
        abi: MTOKEN_ABI as Abi,
        functionName: 'totalSupply',
        chainId,
      },
    ]),
    staleTime: 1000 * 3,
    enabled: !!marketsData && !!chainId && isEvm,
  });
  const totalSupply = (totalSupplyData?.map(d => d.result) || []) as bigint[];

  const { data: interestRateModelData } = useContractReads({
    contracts: marketAddrs?.flatMap(address => [
      {
        address: address as Address,
        abi: MTOKEN_ABI as Abi,
        functionName: 'interestRateModel',
        chainId,
      },
    ]),
    staleTime: 1000 * 3,
    enabled: !!marketsData && !!chainId && isEvm,
  });
  const interestRateModels = (interestRateModelData?.map(d => d.result) || []) as Address[];

  /********************************************
   * Interest rate model related fields
   *********************************************/
  const { data: blocksPerYearData } = useContractReads({
    contracts: interestRateModels?.flatMap(address => [
      {
        address: address as Address,
        abi: IRATE_MODEL_ABI as Abi,
        functionName: 'blocksPerYear',
        chainId,
      },
    ]),
    staleTime: 1000 * 3,
    enabled:
      !!marketsData && !!chainId && isEvm && interestRateModels && interestRateModels.length > 0,
  });
  const blocksPerYear = (blocksPerYearData?.map(d => Number(d.result)) || []) as number[];

  const { data: kinkData } = useContractReads({
    contracts: interestRateModels?.flatMap(address => [
      {
        address: address as Address,
        abi: IRATE_MODEL_ABI as Abi,
        functionName: 'kink',
        chainId,
      },
    ]),
    staleTime: 1000 * 3,
    enabled:
      !!marketsData && !!chainId && isEvm && interestRateModels && interestRateModels.length > 0,
  });
  const kink = (kinkData?.map(d => Number(formatEther((d.result as bigint) || 0n))) ||
    []) as number[];

  const { data: multiplierPerBlockData } = useContractReads({
    contracts: interestRateModels?.flatMap(address => [
      {
        address: address as Address,
        abi: IRATE_MODEL_ABI as Abi,
        functionName: 'multiplierPerBlock',
        chainId,
      },
    ]),
    staleTime: 1000 * 3,
    enabled:
      !!marketsData && !!chainId && isEvm && interestRateModels && interestRateModels.length > 0,
  });
  const multiplierPerBlock = (multiplierPerBlockData?.map(d => d.result) || []) as number[];

  const { data: jumpMultiplierPerBlockData } = useContractReads({
    contracts: interestRateModels?.flatMap(address => [
      {
        address: address as Address,
        abi: IRATE_MODEL_ABI as Abi,
        functionName: 'jumpMultiplierPerBlock',
        chainId,
      },
    ]),
    staleTime: 1000 * 3,
    enabled:
      !!marketsData && !!chainId && isEvm && interestRateModels && interestRateModels.length > 0,
  });
  const jumpMultiplierPerBlock = (jumpMultiplierPerBlockData?.map(d => d.result) || []) as number[];

  const { data: utilizationRateData } = useContractReads({
    contracts: interestRateModels?.flatMap((address, i) => [
      {
        address: address as Address,
        abi: IRATE_MODEL_ABI as Abi,
        functionName: 'utilizationRate',
        args: [cashes[i], totalBorrows[i], totalReserves[i]] as [bigint, bigint, bigint],
        chainId,
      },
    ]),
    staleTime: 1000 * 3,
    enabled:
      !!marketsData && !!chainId && isEvm && interestRateModels && interestRateModels.length > 0,
  });
  const utilizationRate = (utilizationRateData?.map(d =>
    Number(formatEther((d.result as bigint) || 0n))
  ) || []) as number[];

  const blocksPerDay = blocksPerYear[0] / 365;

  const markets: IMarket[] = (marketAddrs as Array<string>)?.map((m: string, i: number) => {
    return {
      address: m as Address,
      decimals: 8,
      underlyingAsset: underlyings[i],
      underlyingDecimals: underlyingDecimals[i],
      symbol: symbols[i],
      supplyRatePerBlock: supplyRatePerBlocks[i],
      borrowRatePerBlock: borrowRatePerBlocks[i],

      supplyApy: (Math.pow((supplyRatePerBlocks[i] * blocksPerDay) / 1e18 + 1, 365) - 1) * 100,
      borrowApy: (Math.pow((borrowRatePerBlocks[i] * blocksPerDay) / 1e18 + 1, 365) - 1) * 100,

      totalReserves: totalReserves[i],
      totalBorrows: totalBorrows[i],
      cash: cashes[i],

      initialExchangeRateMantissa: 200000000000000n,
      reserveFactorMantissa: reserveFactorMantissa[i],

      totalSupply: totalSupply[i],

      interestRateModel: interestRateModels[i],
      blocksPerYear: blocksPerYear[i],
      kink: kink[i], // 0~1
      multiplierPerBlock: multiplierPerBlock[i],
      jumpMultiplierPerBlock: jumpMultiplierPerBlock[i],
      utilizationRate: utilizationRate[i], // 0~1
    };
  });

  // TODO: refetchAll
  return {
    markets,
    refetch,
  };
};
