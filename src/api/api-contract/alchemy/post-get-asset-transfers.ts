import { useMutation } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';

import {
  GetAssetTransfers,
  GetAssetTransfersRequest,
  GetAssetTransfersResponse,
  Transfers,
  UseAlchemyPostAssetTransfers,
} from '~/api/api-contract/alchemy/types';
import { ALCHEMY_POLYGON_MUMBAI_API_KEY } from '~/constants';

import { alchemyApi } from '..';

export const useAlchemyPostAssetTransfers = (options?: UseAlchemyPostAssetTransfers) =>
  useMutation<Transfers[], AxiosError<Transfers[], GetAssetTransfers>, GetAssetTransfers>(
    ['alchemy', 'post', 'asset-transfers'],
    assetTransfersAxios,
    { ...options }
  );

const assetTransfersAxios = async ({ walletAddress }: GetAssetTransfers) => {
  const postReceiveTransfers = async () =>
    (
      await alchemyApi.post<
        GetAssetTransfersResponse,
        AxiosResponse<GetAssetTransfersResponse, GetAssetTransfersRequest>,
        GetAssetTransfersRequest
      >(`/v2/${ALCHEMY_POLYGON_MUMBAI_API_KEY}`, {
        id: 1,
        jsonrpc: '2.0',
        method: 'alchemy_getAssetTransfers',
        params: [
          {
            category: ['external'],
            toAddress: walletAddress,
            withMetadata: true,
          },
        ],
      })
    ).data;

  const postSentTransfers = async () =>
    (
      await alchemyApi.post<
        GetAssetTransfersResponse,
        AxiosResponse<GetAssetTransfersResponse, GetAssetTransfersRequest>,
        GetAssetTransfersRequest
      >(`/v2/${ALCHEMY_POLYGON_MUMBAI_API_KEY}`, {
        id: 1,
        jsonrpc: '2.0',
        method: 'alchemy_getAssetTransfers',
        params: [
          {
            category: ['external'],
            fromAddress: walletAddress,
            withMetadata: true,
          },
        ],
      })
    ).data;

  const [receive, send] = await Promise.all([postReceiveTransfers(), postSentTransfers()]);

  const allsortedTransfer = [...receive.result.transfers, ...send.result.transfers].sort(
    (a, b) => Number(b.blockNum) - Number(a.blockNum)
  );

  return allsortedTransfer;
};
