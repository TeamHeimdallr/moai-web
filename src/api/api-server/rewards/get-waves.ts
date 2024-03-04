import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { api } from '~/api/axios';

import { IWave } from '~/types/rewards';

interface Params {
  networkAbbr: string;
}
interface QueryOption extends UseQueryOptions<Response> {}

interface Request {
  params: Params;
}
type Response = {
  currentWave: IWave;
  waves: IWave[];
};

const axios = async (params: Params) =>
  (await api.get<Response>(`/reward/${params.networkAbbr}/wave`)).data;

export const useGetWaveQuery = (request: Request, options?: QueryOption) => {
  const { params } = request;

  const queryKey = ['GET', 'WAVE', 'INFO', params];
  const data = useQuery<Response>(queryKey, () => axios(params), options);

  return {
    queryKey,
    ...data,
  };
};
