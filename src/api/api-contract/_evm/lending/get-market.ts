import { useParams } from 'react-router-dom';
import { Abi, Address, formatUnits } from 'viem';
import { useContractRead } from 'wagmi';

import { MOAILENS_ADDRESS } from '~/constants';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { getNetworkFull } from '~/utils';
import { NETWORK } from '~/types';
import { IMarket, IMarketWithToken, IMTokenMetadata } from '~/types/lending';

import { MOAI_LENS_ABI } from '~/abi/moai-lens';
import { MTOKEN_ABI } from '~/abi/mtoken';

import { useUserTokenBalances } from '../balance/user-token-balances';

interface IPriceData {
  cToken: Address;
  underlyingPrice: bigint;
}
interface Props {
  marketAddress: Address;
}
export const useGetMarket = ({ marketAddress }: Props) => {
  const { network } = useParams();
  const { selectedNetwork, isEvm } = useNetwork();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const chainId = useNetworkId(currentNetwork);

  const { data: symbol } = useContractRead({
    address: marketAddress as Address,
    abi: MTOKEN_ABI as Abi,
    functionName: 'symbol',
    chainId,
    staleTime: 1000 * 3,
    enabled: !!chainId && isEvm && !!marketAddress,
  });

  const { data: priceData } = useContractRead({
    address: MOAILENS_ADDRESS[NETWORK.THE_ROOT_NETWORK] as Address,
    abi: MOAI_LENS_ABI as Abi,
    functionName: 'cTokenUnderlyingPrice',
    chainId,

    args: [marketAddress],
    staleTime: 1000 * 3,
    enabled: !!chainId && isEvm && !!marketAddress,
  });
  const price = priceData as IPriceData;

  const { data: metadataData, refetch } = useContractRead({
    address: MOAILENS_ADDRESS[NETWORK.THE_ROOT_NETWORK] as Address,
    abi: MOAI_LENS_ABI as Abi,
    functionName: 'cTokenMetadata',
    chainId,
    args: [marketAddress],
    staleTime: 1000 * 3,
    enabled: !!chainId && isEvm,
  });

  const metadata = metadataData as IMTokenMetadata;
  const underlyingAddress = metadata?.underlyingAssetAddress || ('0x' as Address);
  const underlyingDecimals = Number(metadata?.underlyingDecimals || 0n);
  const supplyRatePerBlocks = Number(metadata?.supplyRatePerBlock || 0n);
  const borrowRatePerBlocks = Number(metadata?.borrowRatePerBlock || 0n);

  const totalReserves = metadata?.totalReserves || (0n as bigint);
  const totalBorrows = metadata?.totalBorrows || (0n as bigint);
  const cashes = metadata?.totalCash || (0n as bigint);
  const reserveFactorMantissa = metadata?.reserveFactorMantissa || (0n as bigint);
  const totalSupply = metadata?.totalSupply || (0n as bigint); // ctoken's total supply. not an supplied amount
  const collateralFactorsMantissa = metadata?.collateralFactorMantissa || (0n as bigint);

  const blocksPerYear = 7884000;
  const blocksPerDay = blocksPerYear / 365;

  const market: IMarket = {
    address: marketAddress as Address,
    decimals: 8,
    underlyingAsset: underlyingAddress,
    underlyingDecimals: underlyingDecimals,
    symbol: symbol as string,
    supplyRatePerBlock: supplyRatePerBlocks,
    borrowRatePerBlock: borrowRatePerBlocks,

    supplyApy: (Math.pow((supplyRatePerBlocks * blocksPerDay) / 1e18 + 1, 365) - 1) * 100,
    borrowApy: (Math.pow((borrowRatePerBlocks * blocksPerDay) / 1e18 + 1, 365) - 1) * 100,

    totalReserves: totalReserves,
    totalBorrows: totalBorrows,
    cash: cashes,

    initialExchangeRateMantissa: 200000000000000n,
    reserveFactorMantissa: reserveFactorMantissa,

    totalSupply: totalSupply,

    blocksPerYear,
    collateralFactorsMantissa: collateralFactorsMantissa,

    price: Number(formatUnits(price?.['underlyingPrice'] || 0n, 36 - underlyingDecimals)),
  };

  const { userTokenBalances } = useUserTokenBalances({
    addresses: underlyingAddress ? [underlyingAddress] : [],
  });

  const token = userTokenBalances?.find(t => t.address === market.underlyingAsset);

  const marketWithToken = {
    ...market,
    address: market.address,
    symbol: market.symbol,

    price: token?.price,

    underlyingSymbol: token?.symbol,
    underlyingImage: token?.image,
    underlyingBalance: token?.balance,
  } as IMarketWithToken;

  // TODO: refetchAll
  return {
    market: marketWithToken,
    refetch,
  };
};
