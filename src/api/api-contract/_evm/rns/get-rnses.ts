/* eslint-disable @typescript-eslint/no-explicit-any */
import { getName } from '@ensdomains/ensjs/public';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import pLimit from 'p-limit';
import { Address } from 'viem';

import { NETWORK } from '~/types';

interface QueryOption extends UseQueryOptions<string[]> {}

interface Request {
  network: NETWORK;
  publicClient: any;

  addresses?: string[];
}

const limit = pLimit(20);
const axios = async ({ network, publicClient, addresses }: Request) => {
  if (network !== NETWORK.THE_ROOT_NETWORK) return [];

  const res = await Promise.all(
    addresses?.map(address =>
      limit(async () => await getName(publicClient, { address: address as Address }))
    ) || []
  );

  return res?.map(r => r?.name) || [];
};

export const useGetRnses = (request: Request, options?: QueryOption) => {
  const queryKey = ['GET', 'RNSES', request.addresses];
  const data = useQuery<string[]>(queryKey, () => axios(request), options);

  return {
    queryKey,
    ...data,
  };
};
