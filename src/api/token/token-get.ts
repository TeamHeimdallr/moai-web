import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { encodeParams } from '~/utils';
import { IToken } from '~/types';

import { api } from '../axios';

interface TokenListParams {
  tokens?: string; // token filter를 위한 params. symbol + , 구조. ex) xrp,root
  filter?: string; // property:rule:value(:type). ex) network:eq:trn
}

interface TokenListResponse {
  tokens: IToken[];

  metadata: {
    filter: {
      property?: string;
      rule?: string;
      value?: string;
    };
  };
}

const getTokenListAxios = async (params?: TokenListParams) =>
  (await api.get<TokenListResponse>(`/tokens${encodeParams(params)}`)).data;
export const useGetTokenListQuery = (
  params?: TokenListParams,
  options?: UseQueryOptions<TokenListResponse>
) =>
  useQuery<TokenListResponse>(
    ['token', 'get-token-list', params],
    () => getTokenListAxios(params),
    {
      ...options,
    }
  );

interface TokenParams {
  networkAbbr: string; // trn, xrpl, evm
  symbol: string;
  address?: string;
  currency?: string;
}
// address, currency 중 하나는 반드시 필요

interface TokenResponse {
  token: IToken;

  metadata: {
    query: {
      networkAbbr: string;
      symbol: string;
      address?: string;
      currency?: string;
    };
  };
}

const getTokenAxios = async (params?: TokenParams) =>
  (await api.get<TokenResponse>(`token${encodeParams(params)}`)).data;
export const useGetTokenQuery = (params?: TokenParams, options?: UseQueryOptions<TokenResponse>) =>
  useQuery<TokenResponse>(['token', 'get-token', params], () => getTokenAxios(params), {
    ...options,
  });
