import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query';

import { api } from '~/api/axios';

import { encodeQuery } from '~/utils';
import {
  IFilterMetadata,
  IFilterRequestQuery,
  IPaginationMetadata,
  IPaginationRequestQuery,
  IToken,
} from '~/types';

interface Queries extends IPaginationRequestQuery, IFilterRequestQuery {
  tokens?: string; // token filter를 위한 params. symbol + , 구조. ex) xrp,root
}

interface QueryOption extends UseQueryOptions<Response> {}
interface InfinityQueryOption extends UseInfiniteQueryOptions<Response> {}

interface Request {
  queries: Queries;
}
interface Response {
  tokens: IToken[];

  metadata: {
    pagination?: IPaginationMetadata;
    filter?: IFilterMetadata;
  };
}

const axios = async (queries?: Queries) =>
  (await api.get<Response>(`/tokens${encodeQuery(queries)}`)).data;

export const useGetTokensQuery = (request: Request, options?: QueryOption) => {
  const { queries } = request;

  const queryKey = ['GET', 'TOKENS', queries];
  const data = useQuery<Response>(queryKey, () => axios(queries), options);

  return {
    queryKey,
    ...data,
  };
};

export const useGetTokensInfinityQuery = (request: Request, options?: InfinityQueryOption) => {
  const { queries } = request;

  const queryKey = ['GET', 'TOKENS', 'INFINITY', queries];
  const data = useInfiniteQuery<Response>({
    queryKey,
    queryFn: ({ pageParam: cursor }) => axios({ ...queries, cursor }),
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
