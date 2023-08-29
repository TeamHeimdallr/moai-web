import { useMutation } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';
import { formatEther, fromHex } from 'viem';

import {
  PostGetTokenBalance,
  PostGetTokenBalanceRequest,
  PostGetTokenBalanceResponse,
  TokenBalance,
  UseAlchemyPostGetTokenBalance,
} from '~/api/api-contract/alchemy/types';
import { ALCHEMY_POLYGON_MUMBAI_API_KEY, CONTRACT_ADDRESS } from '~/constants';
import { formatNumber } from '~/utils/number';

import { alchemyApi } from '..';

/**
 *
 * @returns MATIC balance
 */
export const useAlchemyPostGetTokenBalance = (options?: UseAlchemyPostGetTokenBalance) =>
  useMutation<TokenBalance, AxiosError<TokenBalance, PostGetTokenBalance>, PostGetTokenBalance>(
    ['alchemy', 'post', 'get-token-balance'],
    postGetTokenBalance,
    { ...options }
  );

const postGetTokenBalance = async ({ walletAddress }: PostGetTokenBalance) => {
  const res = (
    await alchemyApi.post<
      PostGetTokenBalanceResponse,
      AxiosResponse<PostGetTokenBalanceResponse, PostGetTokenBalanceRequest>,
      PostGetTokenBalanceRequest
    >(`/v2/${ALCHEMY_POLYGON_MUMBAI_API_KEY}`, {
      id: 1,
      jsonrpc: '2.0',
      method: 'alchemy_getTokenBalances',
      params: [walletAddress, [CONTRACT_ADDRESS.CONTRACT_NAME]],
    })
  ).data;

  const tokenBalances = res.result.tokenBalances;
  const hex = tokenBalances.find(
    tokenBalance => tokenBalance.contractAddress === CONTRACT_ADDRESS.CONTRACT_NAME
  )?.tokenBalance;

  if (!hex) return { balance: '0' };
  const balance = formatEther(fromHex(hex as `0x${string}`, 'bigint'));
  const formattedNumber = formatNumber(balance || 0, 4);

  return {
    balance: formattedNumber,
  };
};
