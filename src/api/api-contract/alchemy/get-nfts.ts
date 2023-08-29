import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { isAddress } from 'viem';

import { GetNftsRequest, GetNftsResponse } from '~/api/api-contract/alchemy/types';
import { ALCHEMY_POLYGON_MUMBAI_API_KEY } from '~/constants';
import { encodeParams } from '~/utils/params';

import { alchemyApi } from '..';

export const useAlchemyGetNfts = (
  params: GetNftsRequest,
  options?: UseQueryOptions<GetNftsResponse>
) =>
  useQuery<GetNftsResponse>(['alchemy', 'get', 'get-nfts', params], () => getNftsAxios(params), {
    keepPreviousData: true,
    enabled: isAddress(params.owner),
    ...options,
  });

const getNftsAxios = async (data: GetNftsRequest) =>
  (
    await alchemyApi.get<GetNftsResponse>(
      `nft/v2/${ALCHEMY_POLYGON_MUMBAI_API_KEY}/getNFTs${encodeParams({
        owner: data.owner,
        'contractAddresses[]': data['contractAddresses[]'],
      })}`
    )
  ).data;
