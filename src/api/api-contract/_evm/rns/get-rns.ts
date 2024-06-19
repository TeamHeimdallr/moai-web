/* eslint-disable @typescript-eslint/no-explicit-any */
import { getName } from '@ensdomains/ensjs/public';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { Address } from 'viem';

import { NETWORK } from '~/types';

interface QueryOption extends UseQueryOptions<Response> {}

interface Request {
  network: NETWORK;
  publicClient: any;

  evmAddress?: string;
  fpassAddress?: string;
}

interface Response {
  rns: string;
  fpassRns: string;
}

const axios = async ({ network, publicClient, evmAddress, fpassAddress }: Request) => {
  if (network !== NETWORK.THE_ROOT_NETWORK)
    return {
      rns: '',
      fpassRns: '',
    };

  const res = {
    rns: '',
    fpassRns: '',
  };
  if (!evmAddress) {
    res.rns = '';
  } else {
    const evmRes = await getName(publicClient, {
      address: evmAddress as Address,
    });

    if (evmRes) {
      const { name } = evmRes;
      res.rns = name;
    }
  }

  if (!fpassAddress) {
    res.fpassRns = '';
  } else {
    const fpassRes = await getName(publicClient as any, {
      address: fpassAddress as Address,
    });

    if (fpassRes) {
      const { name } = fpassRes;
      res.fpassRns = name;
    }
  }

  return res;
};

export const useGetRns = (request: Request, options?: QueryOption) => {
  const queryKey = ['GET', 'RNS', request];
  const data = useQuery<Response>(queryKey, () => axios(request), options);

  return {
    queryKey,
    ...data,
  };
};
