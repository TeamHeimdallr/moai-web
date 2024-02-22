import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { api } from '~/api/axios';

import { IChartXYData } from '~/types';
import { LENDING_CHART_TYPE } from '~/types/lending';

interface Params {
  networkAbbr: string;
  marketAddress: string;
}

interface QueryOption extends UseQueryOptions<Response> {}

interface Request {
  params: Params;
}
interface Response {
  [LENDING_CHART_TYPE.SUPPLY]: IChartXYData[];
  [LENDING_CHART_TYPE.BORROW]: IChartXYData[];
  metadata: {
    kink: number;
    numberOfData: number;
  };
}

const axios = async (params: Params) =>
  (
    await api.get<Response>(
      `/lending/${params.networkAbbr}/${params.marketAddress}/interest-rate-model`
    )
  ).data;

export const useGetLendingIRateModelChartQuery = (request: Request, options?: QueryOption) => {
  const { params } = request;

  const queryKey = ['GET', 'LENDING', 'CHART', 'IRATE_MODEL', params];
  const data = useQuery<Response>(queryKey, () => axios(params), options);

  return {
    queryKey,
    ...data,
  };
};
