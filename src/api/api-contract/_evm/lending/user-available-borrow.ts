import { useParams } from 'react-router-dom';
import { Abi, Address, formatUnits, parseUnits } from 'viem';
import { useContractRead } from 'wagmi';

import { MOAILENS_ADDRESS, UNITROLLER_ADDRESS } from '~/constants';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkFull } from '~/utils';
import { NETWORK } from '~/types';

import { COMPTROLLER_ABI } from '~/abi/comptroller';
import { MOAI_LENS_ABI } from '~/abi/moai-lens';

/**
 * @description User's Available Borrow
 */
interface Props {
  mTokenAddress: Address;
}
export const useUserAvailableBorrow = ({ mTokenAddress }: Props) => {
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

  const { data: metaData, refetch: metaDataRefetch } = useContractRead({
    address: MOAILENS_ADDRESS[NETWORK.THE_ROOT_NETWORK] as Address,
    abi: MOAI_LENS_ABI as Abi,
    functionName: 'cTokenMetadata',
    chainId,

    args: [mTokenAddress],
    staleTime: 1000 * 3,
    enabled: !!walletAddress && !!chainId && isEvm && !!mTokenAddress,
  });

  const { data: underlyingPriceData, refetch: underlyingPriceRefetch } = useContractRead({
    address: MOAILENS_ADDRESS[NETWORK.THE_ROOT_NETWORK] as Address,
    abi: MOAI_LENS_ABI as Abi,
    functionName: 'cTokenUnderlyingPrice',
    chainId,

    args: [mTokenAddress],
    staleTime: 1000 * 3,
    enabled: !!chainId && isEvm && !!mTokenAddress,
  });

  //   console.log(metaData, 'metaData');

  const decimals = Number(metaData?.['underlyingDecimals']) as number;
  const price = underlyingPriceData?.['underlyingPrice']
    ? Number(formatUnits(underlyingPriceData?.['underlyingPrice'] as bigint, 36 - decimals))
    : 0;
  const liquidityNum = !price || price === 0 ? 0 : Number(formatUnits(liquidityUsd, 18)) / price;
  const liquidity = parseUnits(liquidityNum.toString(), decimals);

  const totalBorrows = metaData?.['totalBorrows'] as bigint;
  const borrowCap = metaData?.['borrowCap'] as bigint;
  const cash = metaData?.['totalCash'] as bigint;

  let availableAmountRaw = cash;
  if (borrowCap !== 0n) {
    availableAmountRaw =
      availableAmountRaw > borrowCap - totalBorrows ? borrowCap - totalBorrows : availableAmountRaw;
  }
  availableAmountRaw = availableAmountRaw > liquidity ? liquidity : availableAmountRaw;
  availableAmountRaw = availableAmountRaw > 10n ? availableAmountRaw - 10n : 0n; // safe buffer

  const refetch = () => {
    liquidityRefetch();
    metaDataRefetch();
    underlyingPriceRefetch();
  };

  return {
    availableAmountRaw,
    availableAmount: Number(formatUnits(availableAmountRaw, decimals)),
    refetch,
  };
};
