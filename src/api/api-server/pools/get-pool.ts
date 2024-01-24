import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { api } from '~/api/axios';

import { IPool } from '~/types';

interface Params {
  networkAbbr: string;
  poolId: string;
}
interface QueryOption extends UseQueryOptions<Response> {}

interface Request {
  params: Params;
}
interface Response {
  pool: IPool;
}

const axios = async (params: Params) =>
  (await api.get<Response>(`/pool/${params.networkAbbr}/${params.poolId}`)).data;

export const useGetPoolQuery = (request: Request, options?: QueryOption) => {
  const { params } = request;

  const queryKey = ['GET', 'POOL', params];
  const dataDoubleVol = useQuery<Response>(queryKey, () => axios(params), options);

  // TODO: remove /2 when server updated
  const data = {
    ...dataDoubleVol,
    data: {
      pool: {
        ...dataDoubleVol.data?.pool,
        apr: dataDoubleVol.data?.pool.apr
          ? (dataDoubleVol.data?.pool.apr - dataDoubleVol.data?.pool.moaiApr) / 2 +
            dataDoubleVol.data?.pool.moaiApr
          : 0,
        volume: dataDoubleVol.data?.pool.volume ? dataDoubleVol.data?.pool.volume / 2 : 0,
      } as IPool,
    },
  };

  return {
    queryKey,
    ...data,
  };
};
