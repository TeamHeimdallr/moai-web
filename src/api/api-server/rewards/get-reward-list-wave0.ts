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
  my: IRewardParticipant | null;
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
  const data = useQuery<Response>(queryKey, () => axios(params, queries), {
    ...options,
    select: data => ({
      ...data,
      my: data.my
        ? {
            ...data.my,
            volume: data.my.volume > 0 ? data.my.volume : 0,
            premined: data.my.premined > 0 ? data.my.premined : 0,
          }
        : null,
      participants: data.participants.map(participant => ({
        ...participant,
        volume: participant.volume > 0 ? participant.volume : 0,
        premined: participant.premined > 0 ? participant.premined : 0,
      })),
    }),
  });

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
    select: data => ({
      ...data,
      pages: data.pages.map(page => ({
        ...page,
        my: page.my
          ? {
              ...page.my,
              volume: page.my.volume > 0 ? page.my.volume : 0,
              premined: page.my.premined > 0 ? page.my.premined : 0,
            }
          : null,
        participants: page.participants.map(participant => ({
          ...participant,
          volume: participant.volume > 0 ? participant.volume : 0,
          premined: participant.premined > 0 ? participant.premined : 0,
        })),
      })),
    }),
    ...options,
  });

  return {
    queryKey,
    ...data,
  };
};
