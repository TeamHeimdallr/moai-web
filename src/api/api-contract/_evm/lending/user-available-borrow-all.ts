import { useParams } from 'react-router-dom';
import { Abi, Address, formatUnits, parseUnits } from 'viem';
import { useContractRead, useContractReads } from 'wagmi';

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

  // const { data: metaData, refetch: metaDataRefetch } = useContractReads({
  //   contracts: mTokenAddresses?.flatMap(address => [
  //     {
  //       address: MOAILENS_ADDRESS[NETWORK.THE_ROOT_NETWORK] as Address,
  //       abi: MOAI_LENS_ABI as Abi,
  //       functionName: 'cTokenMetadata',
  //       chainId,

  //       args: [address],
  //       staleTime: 1000 * 3,
  //       enabled: !!walletAddress && !!chainId && isEvm && !!address,
  //     },
  //   ]),
  //   staleTime: 1000 * 3,
  //   enabled: !!mTokenAddresses && !!chainId && isEvm && !!walletAddress,
  // });

  // const metaDataList = (metaData?.map(d => {
  //   const r = d.result;
  //   return r as IMetaData;
  // }) || []) as IMetaData[];

  const { data: metadataAll } = useContractRead({
    address: MOAILENS_ADDRESS[NETWORK.THE_ROOT_NETWORK] as Address,
    abi: MOAI_LENS_ABI as Abi,
    functionName: 'cTokenMetadataAll',
    chainId,
    args: [mTokenAddresses],
    staleTime: 1000 * 3,
    enabled: !!chainId && isEvm,
  });
  const metaDataList = (metadataAll as Array<IMTokenMetadata>)?.map((m: IMTokenMetadata) => m);

  const { data: underlyingPriceData, refetch: underlyingPriceRefetch } = useContractReads({
    contracts: mTokenAddresses?.flatMap(address => [
      {
        address: MOAILENS_ADDRESS[NETWORK.THE_ROOT_NETWORK] as Address,
        abi: MOAI_LENS_ABI as Abi,
        functionName: 'cTokenUnderlyingPrice',
        chainId,

        args: [address],
      },
    ]),
    staleTime: 1000 * 3,
    enabled: !!chainId && isEvm && !!mTokenAddresses,
  });

  const undrlyingPriceList = (underlyingPriceData?.map(d => {
    const r = d.result;
    return r?.['underlyingPrice'] as bigint;
  }) || []) as bigint[];

  const availableAmountRawList = metaDataList?.map((metaData, i) => {
    const decimals = Number(metaData?.['underlyingDecimals']) as number;
    const price = undrlyingPriceList[i]
      ? Number(formatUnits(undrlyingPriceList[i] as bigint, 36 - decimals))
      : 0;
    const liquidityNum = !price || price === 0 ? 0 : Number(formatUnits(liquidityUsd, 18)) / price;
    const liquidity = parseUnits(liquidityNum.toString(), decimals);

    const totalBorrows = metaData?.['totalBorrows'] as bigint;
    const borrowCap = metaData?.['borrowCap'] as bigint;
    const cashMinusReserve = ((metaData?.['totalCash'] as bigint) -
      metaData?.['totalReserves']) as bigint;

    let availableAmountRaw = cashMinusReserve;
    if (borrowCap !== 0n) {
      availableAmountRaw =
        availableAmountRaw > borrowCap - totalBorrows
          ? borrowCap - totalBorrows
          : availableAmountRaw;
    }
    availableAmountRaw = availableAmountRaw > liquidity ? liquidity : availableAmountRaw;
    availableAmountRaw = availableAmountRaw > 10n ? availableAmountRaw - 10n : 0n; // safe buffer

    // console.log(
    //   cashMinusReserve,
    //   liquidity,
    //   borrowCap === 0n ? '' : borrowCap - totalBorrows,
    //   availableAmountRaw
    // );

    return availableAmountRaw;
  });

  const availableAmountList = availableAmountRawList?.map((d, i) => {
    const decimals = Number(metaDataList[i]?.['underlyingDecimals']) as number;
    return Number(formatUnits(d, decimals));
  });

  const refetch = () => {
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
