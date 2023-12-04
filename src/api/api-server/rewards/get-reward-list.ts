import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query';

import { api } from '~/api/axios';

import { encodeQuery } from '~/utils';
import { IPaginationMetadata, IPaginationRequestQuery } from '~/types';
import { IRewardParticipant } from '~/types/rewards';

interface Queries extends IPaginationRequestQuery {
  walletAddress?: string;
  wave?: number;
}
interface Params {
  networkAbbr: string;
}

interface QueryOption extends UseQueryOptions<Response> {}
interface InfinityQueryOption extends UseInfiniteQueryOptions<Response> {}

interface Request {
  params: Params;
  queries: Queries;
}
interface Response {
  my: IRewardParticipant;
  participants: IRewardParticipant[];

  metadata: {
    pagination?: IPaginationMetadata;
  };
}

const axios = async (params: Params, queries?: Queries) =>
  (await api.get<Response>(`/reward/${params.networkAbbr}/list${encodeQuery(queries)}`)).data;

export const useGetRewardsListQuery = (request: Request, options?: QueryOption) => {
  const { params, queries } = request;

  const queryKey = ['GET', 'REWARD', 'LIST', params, queries];
  const data = useQuery<Response>(queryKey, () => axios(params, queries), options);

  return {
    queryKey,
    ...data,
  };
};

export const useGetRewardsListInfinityQuery = (request: Request, options?: InfinityQueryOption) => {
  const { params, queries } = request;

  const queryKey = ['GET', 'POOL', 'LIST', 'INFINITY', params, queries];
  const data = useInfiniteQuery<Response>({
    queryKey,
    queryFn: ({ pageParam: cursor }) => axios(params, { ...queries, cursor }),
    getNextPageParam: lastPage => {
      const pagination = lastPage.metadata.pagination;
      if (!pagination) return undefined;

      const { hasNextPage, cursor } = pagination;
      if (!hasNextPage) return undefined;

      return cursor;
    },
    ...options,
  });

  return {
    queryKey,
    ...data,
  };
};
