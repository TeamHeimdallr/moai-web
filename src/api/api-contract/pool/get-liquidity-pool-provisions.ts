import { useQueries, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { Address, formatUnits, PublicClient } from 'viem';
import { usePublicClient } from 'wagmi';

import { QUERY_KEYS } from '~/api/utils/query-keys';
import { CHAIN, CONTRACT_ADDRESS } from '~/constants';
import { useConnectWallet } from '~/hooks/data/use-connect-wallet';
import { GetLiquidityPoolProvisions } from '~/types/contracts/liquidity-pool';

import { getSymbol } from '../token/symbol';

interface GetLiquidityPoolProvisionsProps {
  client: PublicClient;
  poolAddress?: Address;
  my?: boolean;
  provider?: Address;
}
const getLiquidityPoolProvisions = async ({
  client,
  poolAddress,
  my,
  provider,
}: GetLiquidityPoolProvisionsProps) => {
  const block = await client.getBlockNumber();
  const res = await client.getLogs({
    address: CONTRACT_ADDRESS.VAULT,
    event: {
      type: 'event',
      name: 'PoolBalanceChanged',
      inputs: [
        { type: 'bytes32', name: 'poolId', indexed: true },
        { type: 'address', name: 'liquidityProvider', indexed: true },
        { type: 'address[]', name: 'tokens', indexed: false },
        { type: 'int256[]', name: 'deltas', indexed: false },
        { type: 'uint256[]', name: 'protocolFeeAmounts', indexed: false },
      ],
    },
    args: {
      poolId: poolAddress,
      liquidityProvider: my && !!provider ? provider : undefined,
    },
    fromBlock: block - 10000n,
  });

  return res;
};
interface GetFormattedLiquidityPoolProvisionsProps {
  client: PublicClient;
  data: {
    args: {
      poolId?: `0x${string}` | undefined;
      liquidityProvider?: `0x${string}` | undefined;
      tokens?: readonly `0x${string}`[] | undefined;
      deltas?: readonly bigint[] | undefined;
      protocolFeeAmounts?: readonly bigint[] | undefined;
    };
    blockHash: Address;
    txHash: Address;
  };
  address?: Address;
}
const getFormattedLiquidityPoolProvisions = async ({
  client,
  data,
}: GetFormattedLiquidityPoolProvisionsProps) => {
  const isRoot = CHAIN === 'root';
  const decimals = isRoot ? 6 : 18;

  const { args, blockHash, txHash } = data;
  const { deltas, liquidityProvider, poolId, tokens: tokenAddresses } = args;

  const type = deltas?.every(delta => delta >= 0) ? 'deposit' : 'withdraw';

  const tokenSymbolPromises = tokenAddresses?.map(address => getSymbol(client, address));
  const tokenSymbols = await Promise.all(tokenSymbolPromises ?? []);

  const tokens =
    tokenAddresses?.map((address, idx) => ({
      address,
      symbol: tokenSymbols?.[idx],
      amount: Math.abs(Number(formatUnits(deltas?.[idx] ?? 0n, decimals))),
    })) ?? [];

  const blockInfo = await client.getBlock({ blockHash });
  const timestamp = Number(blockInfo?.timestamp ?? Date.now() / 1000) * 1000;

  return {
    type,
    poolId: poolId ?? '0x',
    tokens,
    timestamp,
    liquidityProvider,
    txHash,
  } as GetLiquidityPoolProvisions;
};

interface UseGetLiquidityPoolProvisionsProps {
  poolAddress?: Address;
  my?: boolean;
  options?: UseQueryOptions;
}
export const useGetLiquidityPoolProvisions = ({
  poolAddress,
  options,
}: UseGetLiquidityPoolProvisionsProps) => {
  const client = usePublicClient();
  const { address } = useConnectWallet();

  const { data: liquidityPoolProvisionsData } = useQuery(
    [...QUERY_KEYS.LIQUIIDITY_POOL.GET_PROVISIONS, poolAddress],
    () => getLiquidityPoolProvisions({ client, poolAddress }),
    {
      keepPreviousData: true,
      enabled: !!poolAddress && !!client,
      staleTime: Infinity,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(options as any),
    }
  );

  const queries =
    liquidityPoolProvisionsData?.map(data => ({
      queryKey: [...QUERY_KEYS.LIQUIIDITY_POOL.GET_PROVISIONS, 'formatted', data.blockHash],
      queryFn: () =>
        getFormattedLiquidityPoolProvisions({
          client,
          address,
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
