import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { api } from '~/api/axios';

import { encodeQuery } from '~/utils';
import { ICampaign, IFilterMetadata, IFilterRequestQuery } from '~/types';

interface Queries extends IFilterRequestQuery {}
interface QueryOption extends UseQueryOptions<Response> {}

interface Request {
  queries: Queries;
}
interface Response {
  campaigns: ICampaign[];
  metadata: {
    filter?: IFilterMetadata;
  };
}

const axios = async (queries?: Queries) =>
  (await api.get<Response>(`/campaign${encodeQuery(queries)}`)).data;

export const useGetCampaignsQuery = (request: Request, options?: QueryOption) => {
  const { queries } = request;

  const queryKey = ['GET', 'CAMPAIGNS', queries];
  const data = useQuery<Response>(queryKey, () => axios(queries), options);

  return {
    queryKey,
    ...data,
  };
};
