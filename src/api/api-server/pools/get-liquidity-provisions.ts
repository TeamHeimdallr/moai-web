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
  ILiquidityProvision,
  IPaginationMetadata,
  IPaginationRequestQuery,
  ISortMetadata,
  ISortRequestQuery,
} from '~/types';

interface Queries extends IPaginationRequestQuery, IFilterRequestQuery, ISortRequestQuery {}
interface Params {
  networkAbbr: string;
  poolId: string;
}

interface QueryOption extends UseQueryOptions<Response> {}
interface InfinityQueryOption extends UseInfiniteQueryOptions<Response> {}

interface Request {
  params: Params;
  queries: Queries;
}
interface Response {
  liquidityProvisions: ILiquidityProvision[];

  metadata: {
    pagination?: IPaginationMetadata;
    sort?: ISortMetadata;
    filter?: IFilterMetadata;
  };
}

const axios = async (params: Params, queries?: Queries) =>
  (
    await api.get<Response>(
      `/pool/${params.networkAbbr}/${params.poolId}/liquidity-provisions${encodeQuery(queries)}`
    )
  ).data;

export const useGetLiquidityProvisionsQuery = (request: Request, options?: QueryOption) => {
  const { params, queries } = request;

  const queryKey = ['GET', 'POOL', 'LIQUIDITY_PROVISIONS', params, queries];
  const data = useQuery<Response>(queryKey, () => axios(params, queries), options);

  return {
    queryKey,
    ...data,
  };
};

export const useGetLiquidityProvisionsInfinityQuery = (
  request: Request,
  options?: InfinityQueryOption
) => {
  const { params, queries } = request;

  const queryKey = ['GET', 'POOL', 'LIQUIDITY_PROVISIONS', params, queries];
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
