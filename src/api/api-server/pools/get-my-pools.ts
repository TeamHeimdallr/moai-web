import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';

import { api } from '~/api/axios';

import { encodeQuery } from '~/utils';
import {
  IFilterMetadata,
  IFilterRequestQuery,
  IMyPoolList,
  IMyPoolListRequest,
  IPaginationMetadata,
  IPaginationRequestQuery,
  ISortMetadata,
  ISortRequestQuery,
} from '~/types';

interface Queries extends IPaginationRequestQuery, IFilterRequestQuery, ISortRequestQuery {}

interface Request {
  queries: Queries;
}
export interface Response {
  pools: IMyPoolList[];

  metadata: {
    pagination?: IPaginationMetadata;
    sort?: ISortMetadata;
    filter?: IFilterMetadata;
  };
}

const axios = async (body: IMyPoolListRequest, queries?: Queries) =>
  (
    await api.post<Response, AxiosResponse<Response>, IMyPoolListRequest>(
      `/pools/my${encodeQuery(queries)}`,
      body
    )
  ).data;

type MutateOptions = UseMutationOptions<
  Response,
  AxiosError<Response, IMyPoolListRequest>,
  IMyPoolListRequest
>;
export const useGetMyPoolsQuery = (request: Request, options?: MutateOptions) => {
  const { queries } = request;

  const queryKey = ['POST', 'POOLS', 'MY', queries];
  const data = useMutation<Response, AxiosError<Response, IMyPoolListRequest>, IMyPoolListRequest>(
    queryKey,
    data => axios(data, queries),
    options
  );

  return {
    queryKey,
    ...data,
  };
};

/*
export const useGetMyPoolsInfinityQuery = (request: Request, options?: InfinityQueryOption) => {
  const { queries } = request;

  const queryKey = ['GET', 'POOLS', 'MY', 'INFINITY', queries];
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
*/
