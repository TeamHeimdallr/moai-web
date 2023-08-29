import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { isAddress } from 'viem';

import {
  GetOwnersForCollectionRequest,
  GetOwnersForCollectionResponse,
} from '~/api/api-contract/alchemy/types';
import { ALCHEMY_POLYGON_MUMBAI_API_KEY } from '~/constants';
import { encodeParams } from '~/utils/params';

import { alchemyApi } from '..';

export const useAlchemyGetOwnersForCollection = (
  params: GetOwnersForCollectionRequest,
  options?: UseQueryOptions<GetOwnersForCollectionResponse>
) =>
  useQuery<GetOwnersForCollectionResponse>(
    ['alchemy', 'get', 'get-owners-for-collection', params],
    () => getOwnersForCollection(params),
    {
      keepPreviousData: true,
      enabled: isAddress(params.contractAddress),
      ...options,
    }
  );

const getOwnersForCollection = async ({ contractAddress }: GetOwnersForCollectionRequest) =>
  (
    await alchemyApi.get<GetOwnersForCollectionResponse>(
      `nft/v2/${ALCHEMY_POLYGON_MUMBAI_API_KEY}/getOwnersForCollection${encodeParams({
        contractAddress,
      })}`
    )
  ).data;
