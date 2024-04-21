import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';

import { api } from '~/api/axios';

interface Request {
  account: string;
}

interface Response {
  eligible: boolean;
}

const axios = async (data: Request) =>
  (
    await api.post<Response, AxiosResponse<Response>, Request>(
      `/events/xepe/check-eligibility`,
      data
    )
  ).data;

type MutateOptions = UseMutationOptions<Response, AxiosError<Response, Request>, Request>;
export const useCheckXepeEligibilityMutate = (options?: MutateOptions) => {
  const queryKey = ['POST', 'EVENT', 'XEPE'];
  const data = useMutation<Response, AxiosError<Response, Request>, Request>(
    queryKey,
    axios,
    options
  );

  return {
    queryKey,
    ...data,
  };
};
