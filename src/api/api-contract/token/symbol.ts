import { useQueries } from '@tanstack/react-query';
import { Address, isAddress, PublicClient } from 'viem';
import { usePublicClient } from 'wagmi';

import { TOKEN_ABI } from '~/abi/token';
import { QUERY_KEYS } from '~/api/utils/query-keys';

export const getSymbol = async (client: PublicClient, address: Address) => {
  if (!isAddress(address) || address === '0x') return '';

  const symbol = await client.readContract({
    address,
    abi: TOKEN_ABI,
    functionName: 'symbol',
  });

  return symbol as string;
};

export const useTokenSymbol = (addresses: Address[]) => {
  const client = usePublicClient();

  const getSymbolQuries = addresses.map(address => ({
    queryKey: [...QUERY_KEYS.TOKEN.GET_SYMBOLS, address],
    queryFn: () => getSymbol(client, address),
    staleTime: Infinity,
  }));
  const quries = useQueries({ queries: getSymbolQuries });

  return {
    data: quries.map(query => query.data as string),
    isLoading: quries.some(query => query.isLoading),
    isError: quries.some(query => query.isError),
    isSuccess: quries.every(query => query.isSuccess),
  };
};
