import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { api } from '~/api/axios';

import { encodeQuery } from '~/utils';
import { IFilterMetadata, IFilterRequestQuery, IToken } from '~/types';

interface Queries extends IFilterRequestQuery {
  tokens?: string; // token filter를 위한 params. symbol + , 구조. ex) xrp,root
}

interface QueryOption extends UseQueryOptions<Response> {}

interface Request {
  queries: Queries;
}
interface Response {
  tokens: IToken[];

  metadata: {
    filter?: IFilterMetadata;
  };
}

const axios = async (queries?: Queries) =>
  (await api.get<Response>(`/tokens${encodeQuery(queries)}`)).data;

export const useGetTokensQuery = (request: Request, options?: QueryOption) => {
  const { queries } = request;

  const queryKey = ['GET', 'TOKENS', queries];
  const data = useQuery<Response>(queryKey, () => axios(queries), options);

  return {
    queryKey,
    ...data,
  };
};
