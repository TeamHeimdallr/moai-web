import { useQueries, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { formatUnits } from 'viem';
import { Address, PublicClient, usePublicClient } from 'wagmi';

import { QUERY_KEYS } from '~/api/utils/query-keys';

import { EVM_CONTRACT_ADDRESS, TOKEN_DECIMAL } from '~/constants';

import { useSelecteNetworkStore } from '~/states/data';
import { NETWORK } from '~/types';

import { getTokenPrice } from '../token/price';
import { getTokenSymbol } from '../token/symbol';

// TODO: change to server api
interface GetSwapHistoriesProps {
  client: PublicClient;
  network: NETWORK;
  poolId: Address;
}
const getSwapHistories = async ({ client, network, poolId }: GetSwapHistoriesProps) => {
  const block = await client.getBlockNumber();

  const res = await client.getLogs({
    address: EVM_CONTRACT_ADDRESS[network].VAULT as Address,
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
    args: { poolId: poolId },
    fromBlock: block - 10000n,
  });

  return res;
};

interface GetFormattedSwapHistoriesProps {
  client: PublicClient;
  network: NETWORK;
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
interface SwapTokenInfo {
  address: Address;
  name: string;
  balance: number;
  price: number;
  value: number;
}
const getFormattedSwapHistories = async ({
  client,
  network,
  data,
}: GetFormattedSwapHistoriesProps) => {
  const { args, blockHash, txHash } = data;
  const { poolId, tokenIn, tokenOut, amountIn, amountOut } = args;

  const tokenSymbolPromises = [tokenIn, tokenOut]?.map(address =>
    getTokenSymbol(client, address ?? '0x0')
  );
  const tokenSymbols = await Promise.all(tokenSymbolPromises);

  const tokens: SwapTokenInfo[] = [];

  for (let i = 0; i < tokenSymbols.length; i++) {
    const address = [tokenIn, tokenOut][i] ?? '0x0';
    const name = tokenSymbols?.[i];
    const balance = Number(formatUnits([amountIn, amountOut][i] ?? 0n, TOKEN_DECIMAL[network]));
    const price = await getTokenPrice(client, network, name);
    const value = price * balance;

    tokens.push({
      address,
      name,
      balance,
      price,
      value,
    });
  }

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
  };
};

interface UseGetSwapHistoriesProps {
  poolId: Address;
  options?: UseQueryOptions;
}
export const useGetSwapHistories = ({ poolId, options }: UseGetSwapHistoriesProps) => {
  const client = usePublicClient();
  const { selectedNetwork } = useSelecteNetworkStore();

  const { data: swapHistoriesData } = useQuery(
    [...QUERY_KEYS.SWAP.GET_HISTORIES, poolId],
    () => getSwapHistories({ client, network: selectedNetwork, poolId }),
    {
      keepPreviousData: true,
      enabled: !!poolId && !!client,
      staleTime: 1000 * 5,
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
          network: selectedNetwork,
          data: {
            args: data.args,
            blockHash: data.blockHash,
            txHash: data.transactionHash,
          },
        }),
      staleTime: 1000 * 5,
    })) ?? [];
  const data = useQueries({ queries });

  return {
    data: data.map(query => query.data),
    isLoading: data.some(query => query.isLoading),
    isError: data.some(query => query.isError),
    isSuccess: data.every(query => query.isSuccess),
  };
};
