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
  IPoolList,
  IPoolTokenList,
  ISortMetadata,
  ISortRequestQuery,
} from '~/types';

interface Queries extends IPaginationRequestQuery, IFilterRequestQuery, ISortRequestQuery {
  tokens?: string; // token filter를 위한 params. symbol + , 구조. ex) xrp,root
}

interface QueryOption extends UseQueryOptions<Response> {}
interface InfinityQueryOption extends UseInfiniteQueryOptions<Response> {}

interface Request {
  queries: Queries;
}
interface Response {
  pools: IPoolList[];
  poolTokens: IPoolTokenList[];

  metadata: {
    pagination?: IPaginationMetadata;
    sort?: ISortMetadata;
    filter?: IFilterMetadata;

    // token filter params를 넣어서 호출한 경우
    tokens?: string[];
    totalPoolTokenCount?: number;
  };
}

const axios = async (queries?: Queries) =>
  (await api.get<Response>(`/pools${encodeQuery(queries)}`)).data;

export const useGetPoolsQuery = (request: Request, options?: QueryOption) => {
  const { queries } = request;

  const queryKey = ['GET', 'POOLS', queries];
  const data = useQuery<Response>(queryKey, () => axios(queries), options);

  return {
    queryKey,
    ...data,
  };
};

export const useGetPoolsInfinityQuery = (request: Request, options?: InfinityQueryOption) => {
  const { queries } = request;

  const queryKey = ['GET', 'POOLS', 'INFINITY', queries];
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
