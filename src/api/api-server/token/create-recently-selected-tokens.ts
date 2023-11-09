import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';

import { api } from '~/api/axios';

import { ICreateRecentlySelectedTokenRequest, IToken } from '~/types';

interface Response {
  tokens: IToken[];
}

const axios = async (data: ICreateRecentlySelectedTokenRequest) =>
  (
    await api.post<Response, AxiosResponse<Response>, ICreateRecentlySelectedTokenRequest>(
      `/tokens/recent`,
      data
    )
  ).data;

type MutateOptions = UseMutationOptions<
  Response,
  AxiosError<Response, ICreateRecentlySelectedTokenRequest>,
  ICreateRecentlySelectedTokenRequest
>;
export const useCreateRecentlySelectedTokensMutate = (options?: MutateOptions) => {
  const queryKey = ['POST', 'TOKENS', 'RECENTLY_SELECTED'];
  const data = useMutation<
    Response,
    AxiosError<Response, ICreateRecentlySelectedTokenRequest>,
    ICreateRecentlySelectedTokenRequest
  >(queryKey, axios, options);

  return {
    queryKey,
    ...data,
  };
};
