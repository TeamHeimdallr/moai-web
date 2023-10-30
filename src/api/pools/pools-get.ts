import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { encodeParams } from '~/utils';
import { IPool, IPoolList, IPoolTokenList } from '~/types';

import { api } from '../axios';

interface PoolsParams {
  tokens?: string; // token filter를 위한 params. symbol + , 구조. ex) xrp,root

  sort?: string; // property:direction. ex)createdAt:desc
  filter?: string; // property:rule:value(:type). ex) network:eq:trn
  cursor?: number; // id of last item of previous page
  take?: number; // number of items to take
}

interface PoolsResponse {
  pools: IPoolList[];
  poolTokens: IPoolTokenList[];

  metadata: {
    // pagination params를 넣어서 호출한 경우
    pagination: {
      cursor: number;
      take: number;
      totalCount: number;
      totalPage: number;
      hasNextPage: number;
    };
    // sort params를 넣어서 호출한 경우
    sort: {
      property: string;
      direction: string;
    };
    // filter params를 넣어서 호출한 경우
    filter: {
      property: string;
      rule: string;
      value: string;
    };
    // token filter params를 넣어서 호출한 경우
    tokens: string[];
    totalPoolTokenCount: number;
  };
}

const getPoolsAxios = async (params?: PoolsParams) =>
  (await api.get<PoolsResponse>(`/pools${encodeParams(params)}`)).data;
export const useGetPoolsQuery = (params?: PoolsParams, options?: UseQueryOptions<PoolsResponse>) =>
  useQuery<PoolsResponse>(['pools', 'get-pools', params], () => getPoolsAxios(params), {
    ...options,
  });

interface PoolByIdResponse {
  pool: IPool;
}

const getPoolsByIdAxios = async (networkAbbr: string, poolId: string) =>
  (await api.get<PoolByIdResponse>(`/pool/:${networkAbbr}/:${poolId}`)).data;
export const useGetPoolsByIdQuery = (
  networkAbbr: string,
  poolId: string,
  options?: UseQueryOptions<PoolByIdResponse>
) =>
  useQuery<PoolByIdResponse>(
    ['pools', 'get-pools-by-id', networkAbbr, poolId],
    () => getPoolsByIdAxios(networkAbbr, poolId),
    { ...options }
  );
