import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { api } from '~/api/axios';

import { IPoolVaultAmm } from '~/types';

interface Params {
  networkAbbr: string;
  poolId: string;
}
interface QueryOption extends UseQueryOptions<Response> {}

interface Request {
  params: Params;
}
interface Response {
  poolVaultAmm: IPoolVaultAmm;
}

const axios = async (params: Params) =>
  (await api.get<Response>(`/pool/${params.networkAbbr}/${params.poolId}/vault-amm`)).data;

export const useGetPoolVaultAmmQuery = (request: Request, options?: QueryOption) => {
  const { params } = request;

  const queryKey = ['GET', 'POOL', 'VAULT_AMM', params];
  const data = useQuery<Response>(queryKey, () => axios(params), options);

  return {
    queryKey,
    ...data,
  };
};
