import { useQueries, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { Address, formatUnits, PublicClient } from 'viem';
import { usePublicClient } from 'wagmi';

import { CONTRACT_ADDRESS, TOKEN_DECIAML, TOKEN_USD_MAPPER } from '~/moai-evm/constants';

import { QUERY_KEYS } from '~/moai-evm/api/utils/query-keys';
import { GetSwapHistories } from '~/moai-evm/types/contracts';

import { getTokenSymbol } from '../token/symbol';

interface GetSwapHistoriesProps {
  client: PublicClient;
  poolId?: Address;
}
const getSwapHistories = async ({ client, poolId }: GetSwapHistoriesProps) => {
  const block = await client.getBlockNumber();
  const res = await client.getLogs({
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
    args: { poolId },
    fromBlock: block - 10000n,
  });

  return res;
};

interface GetFormattedSwapHistoriesProps {
  client: PublicClient;
  data: {
    args: {
      poolId?: Address | undefined;
      tokenIn?: Address | undefined;
      tokenOut?: Address | undefined;
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
    getTokenSymbol(client, address ?? '0x0')
  );
  const tokenSymbols = await Promise.all(tokenSymbolPromises);

  const tokens =
    [tokenIn, tokenOut]?.map((address, idx) => {
      const name = tokenSymbols?.[idx] ?? '';
      const balance = Number(formatUnits([amountIn, amountOut]?.[idx] ?? 0n, TOKEN_DECIAML));
      const price = TOKEN_USD_MAPPER[name] ?? 0;

      return {
        address,
        name,
        balance,
        price: price,
        value: price * balance,
      };
    }) ?? [];

  const blockInfo = await client.getBlock({ blockHash });
  const transaction = await client.getTransaction({ hash: txHash });

  const trader = transaction?.from ?? '0x0';
  const time = Number(blockInfo?.timestamp ?? Date.now() / 1000) * 1000;

  return {
    poolId: poolId ?? '0x0',
    tokens,
    trader,
    time,
    txHash,
  } as GetSwapHistories;
};

interface UseGetSwapHistoriesProps {
  poolId?: Address;
  options?: UseQueryOptions;
}
export const useGetSwapHistories = ({ poolId, options }: UseGetSwapHistoriesProps) => {
  const client = usePublicClient();

  const { data: swapHistoriesData } = useQuery(
    [...QUERY_KEYS.SWAP.GET_HISTORIES, poolId],
    () => getSwapHistories({ client, poolId }),
    {
      keepPreviousData: true,
      enabled: !!poolId && !!client,
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
