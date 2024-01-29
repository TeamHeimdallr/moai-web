import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';

import { api } from '~/api/axios';

import { IFaucetXrplRequest } from '~/types';

export interface Response {
  success: boolean;
  code: string;
  message: string;
}

const axios = async (body: IFaucetXrplRequest) =>
  (await api.post<Response, AxiosResponse<Response>, IFaucetXrplRequest>(`/faucet/xrpl`, body))
    .data;

type MutateOptions = UseMutationOptions<
  Response,
  AxiosError<Response, IFaucetXrplRequest>,
  IFaucetXrplRequest
>;
export const usePostFaucetXrpl = (options?: MutateOptions) => {
  const queryKey = ['POST', 'FAUCET', 'XRPL'];
  const data = useMutation<Response, AxiosError<Response, IFaucetXrplRequest>, IFaucetXrplRequest>(
    queryKey,
    data => axios(data),
    options
  );

  return {
    queryKey,
    ...data,
  };
};
