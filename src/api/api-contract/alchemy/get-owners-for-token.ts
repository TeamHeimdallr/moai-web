import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { isAddress } from 'viem';

import {
  GetOwnersForTokenRequest,
  GetOwnersForTokenResponse,
} from '~/api/api-contract/alchemy/types';
import { ALCHEMY_POLYGON_MUMBAI_API_KEY } from '~/constants';
import { encodeParams } from '~/utils/params';

import { alchemyApi } from '..';

export const useAlchemyGetOwnersForToken = (
  params: GetOwnersForTokenRequest,
  options?: UseQueryOptions<GetOwnersForTokenResponse>
) =>
  useQuery<GetOwnersForTokenResponse>(
    ['alchemy', 'get', 'get-owners-for-token', params],
    () => getOwnersForToken(params),
    {
      keepPreviousData: true,
      enabled: isAddress(params.contractAddress) && !!params.tokenId,
      ...options,
    }
  );

const getOwnersForToken = async ({ contractAddress, tokenId }: GetOwnersForTokenRequest) =>
  (
    await alchemyApi.get<GetOwnersForTokenResponse>(
      `nft/v2/${ALCHEMY_POLYGON_MUMBAI_API_KEY}/getOwnersForToken${encodeParams({
        contractAddress,
        tokenId,
      })}`
    )
  ).data;
