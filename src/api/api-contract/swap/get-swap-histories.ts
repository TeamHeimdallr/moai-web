import { useQueries, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { Address, formatEther, PublicClient } from 'viem';
import { usePublicClient } from 'wagmi';

import { QUERY_KEYS } from '~/api/utils/query-keys';
import { CONTRACT_ADDRESS } from '~/constants';
import { GetSwapHistories } from '~/types/contracts';

import { getSymbol } from '../token/symbol';

interface GetSwapHistoriesProps {
  client: PublicClient;
  poolAddress?: Address;
}
const getSwapHistories = async ({ client, poolAddress }: GetSwapHistoriesProps) =>
  await client.getLogs({
    address: CONTRACT_ADDRESS.VAULT,
    event: {
      type: 'event',
      name: 'Swap',
      inputs: [
        { type: 'bytes32', name: 'poolId', indexed: true },
        { type: 'address', name: 'tokenIn', indexed: true },
        { type: 'address', name: 'tokenOut', indexed: true },
        { type: 'uint256', name: 'amountIn', indexed: false },
        { type: 'uint256', name: 'amountOut', indexed: false },
      ],
    },
    args: {
      poolId: poolAddress,
    },
    fromBlock: 0n,
  });

interface GetFormattedSwapHistoriesProps {
  client: PublicClient;
  data: {
    args: {
      poolId?: `0x${string}` | undefined;
      tokenIn?: `0x${string}` | undefined;
      tokenOut?: `0x${string}` | undefined;
      amountIn?: bigint | undefined;
      amountOut?: bigint | undefined;
    };
    blockHash: Address;
    txHash: Address;
  };
}
const getFormattedSwapHistories = async ({ client, data }: GetFormattedSwapHistoriesProps) => {
  const { args, blockHash, txHash } = data;
  const { poolId, tokenIn, tokenOut, amountIn, amountOut } = args;

  const tokenSymbolPromises = [tokenIn, tokenOut]?.map(address =>
    getSymbol(client, address ?? '0x')
  );
  const tokenSymbols = await Promise.all(tokenSymbolPromises);

  const tokens =
    [tokenIn, tokenOut]?.map((address, idx) => ({
      address,
      symbol: tokenSymbols?.[idx],
      amount: Number(formatEther([amountIn, amountOut]?.[idx] ?? 0n)),
    })) ?? [];

  const blockInfo = await client.getBlock({ blockHash });
  const transaction = await client.getTransaction({ hash: txHash });

  const trader = transaction?.from ?? '0x';
  const time = Number(blockInfo?.timestamp ?? Date.now() / 1000) * 1000;

  return {
    poolId: poolId ?? '0x',
    tokens,
    trader,
    time,
    txHash,
  } as GetSwapHistories;
};

interface UseGetSwapHistoriesProps {
  poolAddress?: Address;
  options?: UseQueryOptions;
}
export const useGetSwapHistories = ({ poolAddress, options }: UseGetSwapHistoriesProps) => {
  const client = usePublicClient();

  const { data: swapHistoriesData } = useQuery(
    [...QUERY_KEYS.SWAP.GET_HISTORIES, poolAddress],
    () => getSwapHistories({ client, poolAddress }),
    {
      keepPreviousData: true,
      enabled: !!poolAddress && !!client,
      staleTime: Infinity,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(options as any),
    }
  );

  const queries =
    swapHistoriesData?.map(data => ({
      queryKey: [...QUERY_KEYS.SWAP.GET_HISTORIES, 'formatted', data.blockHash],
      queryFn: () =>
        getFormattedSwapHistories({
          client,
          data: { args: data.args, blockHash: data.blockHash, txHash: data.transactionHash },
        }),
      staleTime: Infinity,
    })) ?? [];
  const data = useQueries({ queries });

  return {
    data: data.map(query => query.data),
    isLoading: data.some(query => query.isLoading),
    isError: data.some(query => query.isError),
    isSuccess: data.every(query => query.isSuccess),
  };
};
