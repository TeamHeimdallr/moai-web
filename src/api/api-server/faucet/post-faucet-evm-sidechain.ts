import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';

import { api } from '~/api/axios';

import { IFaucetEvmSidechainRequest } from '~/types';

export interface Response {
  success: boolean;
  code: string;
  message: string;
}

const axios = async (body: IFaucetEvmSidechainRequest) =>
  (
    await api.post<Response, AxiosResponse<Response>, IFaucetEvmSidechainRequest>(
      `/faucet/evm-sidechain`,
      body
    )
  ).data;

type MutateOptions = UseMutationOptions<
  Response,
  AxiosError<Response, IFaucetEvmSidechainRequest>,
  IFaucetEvmSidechainRequest
>;
export const usePostFaucetEvmSidechain = (options?: MutateOptions) => {
  const queryKey = ['POST', 'FAUCET', 'EVM_SIDECHAIN'];
  const data = useMutation<
    Response,
    AxiosError<Response, IFaucetEvmSidechainRequest>,
    IFaucetEvmSidechainRequest
  >(queryKey, data => axios(data), options);

  return {
    queryKey,
    ...data,
  };
};
