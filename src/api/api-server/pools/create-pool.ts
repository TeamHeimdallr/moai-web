import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';

import { api } from '~/api/axios';

import { ICreatePoolXrplRequest } from '~/types';

interface Response {
  account: string;
}

const axios = async (data: ICreatePoolXrplRequest) =>
  (await api.post<Response, AxiosResponse<Response>, ICreatePoolXrplRequest>(`/pools/xrpl`, data))
    .data;

type MutateOptions = UseMutationOptions<
  Response,
  AxiosError<Response, ICreatePoolXrplRequest>,
  ICreatePoolXrplRequest
>;
export const useCreatePoolXrplMutate = (options?: MutateOptions) => {
  const queryKey = ['POST', 'POOL', 'XRPL'];
  const data = useMutation<
    Response,
    AxiosError<Response, ICreatePoolXrplRequest>,
    ICreatePoolXrplRequest
  >(queryKey, axios, options);

  return {
    queryKey,
    ...data,
  };
};
