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
  const dataDoubleVol = useQuery<Response>(queryKey, () => axios(queries), options);

  // TODO: remove /2 when server updated
  const data = {
    ...dataDoubleVol,
    data: {
      ...dataDoubleVol.data,
      pools: dataDoubleVol.data?.pools.map(pool => ({
        ...pool,
        volume: pool.volume / 2,
        apr: pool.apr ? (pool.apr - pool.moiApr) / 2 + pool.moiApr : undefined,
      })),
    },
  };

  return {
    queryKey,
    ...data,
  };
};

export const useGetPoolsInfinityQuery = (request: Request, options?: InfinityQueryOption) => {
  const { queries } = request;

  const queryKey = ['GET', 'POOLS', 'INFINITY', queries];
  const dataDoubleVol = useInfiniteQuery<Response>({
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

  // TODO: remove /2 when server updated
  const data = {
    ...dataDoubleVol,
    data: {
      ...dataDoubleVol.data,
      pages: dataDoubleVol.data?.pages.map(page => ({
        ...page,
        pools: page.pools.map(pool => ({
          ...pool,
          volume: pool.volume / 2,
          apr: pool.apr ? (pool.apr - pool.moiApr) / 2 + pool.moiApr : undefined,
        })),
      })),
    },
  };

  return {
    queryKey,
    ...data,
  };
};
