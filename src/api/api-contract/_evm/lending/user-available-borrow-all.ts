import { useParams } from 'react-router-dom';
import { Abi, Address, formatUnits, parseUnits } from 'viem';
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
 * @description User's Available Borrow
 */
interface IPriceData {
  cToken: Address;
  underlyingPrice: bigint;
}
interface Props {
  mTokenAddresses: Address[];
}
export const useUserAvailableBorrowAll = ({ mTokenAddresses }: Props) => {
  const { network } = useParams();
  const { selectedNetwork, isEvm, isFpass } = useNetwork();
  const { evm, fpass } = useConnectedWallet();
  const { address: walletAddress } = isFpass ? fpass : evm;

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const chainId = useNetworkId(currentNetwork);

  const {
    data: liquidityData,
    refetch: liquidityRefetch,
    isError: isContractReadError,
  } = useContractRead({
    address: UNITROLLER_ADDRESS[NETWORK.THE_ROOT_NETWORK] as Address,
    abi: COMPTROLLER_ABI as Abi,
    functionName: 'getAccountLiquidity',
    chainId,

    args: [walletAddress],
    staleTime: 1000 * 3,
    enabled: !!walletAddress && !!chainId && isEvm,
  });

  const noParticipation = !liquidityData;
  const isError = liquidityData?.[0] !== 0n || isContractReadError;
  const liquidityUsd = (noParticipation || isError ? 0n : liquidityData?.[1]) || 0n;

  const { data: metadataAll, refetch: metaDataRefetch } = useContractRead({
    address: MOAILENS_ADDRESS[NETWORK.THE_ROOT_NETWORK] as Address,
    abi: MOAI_LENS_ABI as Abi,
    functionName: 'cTokenMetadataAll',
    chainId,
    args: [mTokenAddresses],
    staleTime: 1000 * 3,
    enabled: !!chainId && isEvm && !!mTokenAddresses && mTokenAddresses.length > 0,
  });
  const metaDataList = (metadataAll as Array<IMTokenMetadata>)?.map((m: IMTokenMetadata) => m);

  const { data: pricesData, refetch: underlyingPriceRefetch } = useContractRead({
    address: MOAILENS_ADDRESS[NETWORK.THE_ROOT_NETWORK] as Address,
    abi: MOAI_LENS_ABI as Abi,
    functionName: 'cTokenUnderlyingPriceAll',
    chainId,

    args: [mTokenAddresses],
    staleTime: 1000 * 3,
    enabled: !!chainId && isEvm && !!mTokenAddresses && mTokenAddresses.length > 0,
  });
  const prices = pricesData as Array<IPriceData>;
  const undrlyingPriceList = prices?.map(d => (d?.['underlyingPrice'] || 0n) as bigint) || [];

  const availableAmountRawList = metaDataList?.map((metaData, i) => {
    const decimals = Number(metaData?.['underlyingDecimals'] || 0n) as number;
    const price = undrlyingPriceList[i]
      ? Number(formatUnits(undrlyingPriceList[i] as bigint, 36 - decimals))
      : 0;
    const liquidityNum = !price || price === 0 ? 0 : Number(formatUnits(liquidityUsd, 18)) / price;
    const liquidity = parseUnits(liquidityNum.toString(), decimals);

    const totalBorrows = (metaData?.['totalBorrows'] || 0n) as bigint;
    const borrowCap = (metaData?.['borrowCap'] || 0n) as bigint;
    const cash = (metaData?.['totalCash'] || 0n) as bigint;

    let availableAmountRaw = cash;
    if (borrowCap !== 0n) {
      availableAmountRaw =
        availableAmountRaw > borrowCap - totalBorrows
          ? borrowCap - totalBorrows
          : availableAmountRaw;
    }
    availableAmountRaw = availableAmountRaw > liquidity ? liquidity : availableAmountRaw;
    availableAmountRaw = availableAmountRaw > 10n ? availableAmountRaw - 10n : 0n; // safe buffer

    return availableAmountRaw;
  });

  const availableAmountList = availableAmountRawList?.map((d, i) => {
    const decimals = Number(metaDataList?.[i]?.['underlyingDecimals'] || 0n) as number;
    return Number(formatUnits(d, decimals));
  });

  const refetch = () => {
    if (!mTokenAddresses || !mTokenAddresses.length) return;

    liquidityRefetch();
    metaDataRefetch();
    underlyingPriceRefetch();
  };

  return {
    availableAmountRawList,
    availableAmountList,
    refetch,
  };
};
