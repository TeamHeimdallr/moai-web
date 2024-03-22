import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';

import { api } from '~/api/axios';

import { ICreateTokenXrplRequest, IToken } from '~/types';

interface Response {
  token: IToken;
}

const axios = async (data: ICreateTokenXrplRequest) =>
  (await api.post<Response, AxiosResponse<Response>, ICreateTokenXrplRequest>(`/token/xrpl`, data))
    .data;

type MutateOptions = UseMutationOptions<
  Response,
  AxiosError<Response, ICreateTokenXrplRequest>,
  ICreateTokenXrplRequest
>;
export const useCreateTokenXrplMutate = (options?: MutateOptions) => {
  const queryKey = ['POST', 'TOKEN', 'XRPL'];
  const data = useMutation<
    Response,
    AxiosError<Response, ICreateTokenXrplRequest>,
    ICreateTokenXrplRequest
  >(queryKey, axios, options);

  return {
    queryKey,
    ...data,
  };
};
