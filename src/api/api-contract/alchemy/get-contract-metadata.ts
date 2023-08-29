import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { isAddress } from 'viem';

import {
  GetContractMetadataRequest,
  GetContractMetadataResponse,
} from '~/api/api-contract/alchemy/types';
import { ALCHEMY_POLYGON_MUMBAI_API_KEY } from '~/constants';
import { encodeParams } from '~/utils/params';

import { alchemyApi } from '..';

export const useAlchemyGetContractMetadata = (
  params: GetContractMetadataRequest,
  options?: UseQueryOptions<GetContractMetadataResponse>
) =>
  useQuery<GetContractMetadataResponse>(
    ['alchemy', 'get', 'get-contract-metadata', params],
    () => getContractMetadata(params),
    {
      keepPreviousData: true,
      enabled: isAddress(params.contractAddress),
      ...options,
    }
  );

const getContractMetadata = async ({ contractAddress }: GetContractMetadataRequest) =>
  (
    await alchemyApi.get<GetContractMetadataResponse>(
      `nft/v2/${ALCHEMY_POLYGON_MUMBAI_API_KEY}/getContractMetadata${encodeParams({
        contractAddress,
      })}`
    )
  ).data;
