import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { isAddress } from 'viem';

import { POLYGONSCAN_POLYGON_MUMBAI_API_KEY } from '~/constants';
import { encodeParams } from '~/utils/params';

import { polygonscanApi } from '..';
import { GetTransferRequest, GetTransferResponse } from './types';

export const usePolygonscanGetTransfer = (
  params: GetTransferRequest,
  options?: UseQueryOptions<GetTransferResponse>
) =>
  useQuery<GetTransferResponse>(
    ['polygonscan', 'get', 'get-transfer', params],
    () => getTransferAxios(params),
    {
      keepPreviousData: true,
      enabled: isAddress(params.address),
      ...options,
    }
  );

const getTransferAxios = async ({ address }: GetTransferRequest) =>
  (
    await polygonscanApi.get<GetTransferResponse>(
      `api/${encodeParams({
        module: 'account',
        action: 'txlistinternal',
        apikey: POLYGONSCAN_POLYGON_MUMBAI_API_KEY,
        sort: 'desc',
        address,
      })}`
    )
  ).data;
