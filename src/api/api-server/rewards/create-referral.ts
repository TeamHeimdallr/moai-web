import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';

import { api } from '~/api/axios';

interface Body {
  walletAddress: string;
  code: string;
  wave: number;
}
interface Params {
  networkAbbr: string;
}

interface Request {
  params: Params;
}

export interface Response {
  success: boolean;
}

const axios = async (params: Params, body: Body) =>
  (
    await api.post<Response, AxiosResponse<Response>, Body>(
      `/reward/${params.networkAbbr}/referral`,
      body
    )
  ).data;

type MutateOptions = UseMutationOptions<Response, AxiosError<Response, Body>, Body>;
export const usePostCreateReferral = (request: Request, options?: MutateOptions) => {
  const queryKey = ['POST', 'CREATE', 'REWARD', 'REFERRAL'];

  const data = useMutation<Response, AxiosError<Response, Body>, Body>(
    queryKey,
    data => axios(request.params, data),
    options
  );

  return {
    queryKey,
    ...data,
  };
};
