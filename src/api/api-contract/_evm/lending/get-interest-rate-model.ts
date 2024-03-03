import { useParams } from 'react-router-dom';
import { Abi, Address, formatEther } from 'viem';
import { useContractRead } from 'wagmi';

import { MOAILENS_ADDRESS } from '~/constants';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { getNetworkFull } from '~/utils';
import { NETWORK } from '~/types';
import { IMTokenMetadata } from '~/types/lending';

import { IRATE_MODEL_ABI } from '~/abi/interest-rate-model';
import { MOAI_LENS_ABI } from '~/abi/moai-lens';
import { MTOKEN_ABI } from '~/abi/mtoken';

/**
 * @description Get Interest Rate Model
 */
interface Props {
  marketAddress: Address;
}
export const useGetInterestRateModel = ({ marketAddress }: Props) => {
  const { network } = useParams();
  const { selectedNetwork, isEvm } = useNetwork();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const chainId = useNetworkId(currentNetwork);

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

  const { data: interestRateModelData } = useContractRead({
    address: marketAddress as Address,
    abi: MTOKEN_ABI as Abi,
    functionName: 'interestRateModel',
    chainId,
    staleTime: 1000 * 3,
    enabled: !!marketAddress && !!chainId && isEvm,
  });
  const interestRateModel = interestRateModelData as Address;

  /********************************************
   * Interest rate model related fields
   *********************************************/
  const { data: kinkData } = useContractRead({
    address: interestRateModel as Address,
    abi: IRATE_MODEL_ABI as Abi,
    functionName: 'kink',
    chainId,
    staleTime: 1000 * 3,
    enabled: !!marketAddress && !!chainId && isEvm && !!interestRateModel,
  });

  const kink = Number(formatEther((kinkData ?? 800000000000000000n) as bigint)) as number;

  const { data: multiplierPerBlockData } = useContractRead({
    address: interestRateModel as Address,
    abi: IRATE_MODEL_ABI as Abi,
    functionName: 'multiplierPerBlock',
    chainId,
    staleTime: 1000 * 3,
    enabled: !!marketAddress && !!chainId && isEvm && !!interestRateModel,
  });

  const multiplierPerBlock = Number(multiplierPerBlockData) as number;

  const { data: jumpMultiplierPerBlockData } = useContractRead({
    address: interestRateModel as Address,
    abi: IRATE_MODEL_ABI as Abi,
    functionName: 'jumpMultiplierPerBlock',
    chainId,
    staleTime: 1000 * 3,
    enabled: !!marketAddress && !!chainId && isEvm && !!interestRateModel,
  });

  const jumpMultiplierPerBlock = Number(jumpMultiplierPerBlockData) as number;

  const { data: utilizationRateData } = useContractRead({
    address: interestRateModel as Address,
    abi: IRATE_MODEL_ABI as Abi,
    functionName: 'utilizationRate',
    chainId,
    args: [metadata?.totalCash, metadata?.totalBorrows, metadata?.totalReserves] as [
      bigint,
      bigint,
      bigint,
    ],
    staleTime: 1000 * 3,
    enabled: !!marketAddress && !!chainId && isEvm && !!interestRateModel,
  });

  const utilizationRate = Number(formatEther((utilizationRateData ?? 0n) as bigint)) as number;

  const blocksPerYear = 7884000;

  return {
    interestRateModel,
    params: {
      kink,
      multiplierPerBlock,
      jumpMultiplierPerBlock,
      blocksPerYear,
    },
    utilizationRate,
    refetch,
  };
};
