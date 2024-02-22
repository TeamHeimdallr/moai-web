import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { api } from '~/api/axios';

import { encodeQuery } from '~/utils';
import { IChartData } from '~/types';
import { LENDING_CHART_TYPE } from '~/types/lending';

interface Queries {
  range: string; // '24h' | '7d' | '14d' | 'all';
}

interface Params {
  networkAbbr: string;
  marketAddress: string;
  type: LENDING_CHART_TYPE;
}

interface QueryOption extends UseQueryOptions<Response> {}

interface Request {
  params: Params;
  queries: Queries;
}
interface Response {
  data: IChartData[];
  metadata: {
    ragne: string;
    from: Date;
    to: Date;
    numberOfData: number;
    type: LENDING_CHART_TYPE;
  };
}

const axios = async (params: Params, queries?: Queries) =>
  (
    await api.get<Response>(
      `/lending/${params.networkAbbr}/${
        params.marketAddress
      }/apy-${params.type.toLocaleLowerCase()}${encodeQuery(queries)}`
    )
  ).data;

export const useGetLendingAPYChartQuery = (request: Request, options?: QueryOption) => {
  const { params, queries } = request;

  const queryKey = ['GET', 'LENDING', 'CHART', 'APY', params, queries];
  const data = useQuery<Response>(queryKey, () => axios(params, queries), options);

  return {
    queryKey,
    ...data,
  };
};
