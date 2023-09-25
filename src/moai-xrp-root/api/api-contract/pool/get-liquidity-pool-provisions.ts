import { useQueries, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { Address, formatUnits, PublicClient } from 'viem';
import { usePublicClient } from 'wagmi';

import { CONTRACT_ADDRESS, TOKEN_DECIAML } from '~/moai-xrp-root/constants';

import { getRootNetworkTokenPrice } from '~/moai-xrp-root/hooks/data/use-root-network-token-price';
import { QUERY_KEYS } from '~/moai-xrp-root/api/utils/query-keys';
import { GetLiquidityPoolProvisions } from '~/moai-xrp-root/types/contracts/liquidity-pool';

import { getTokenSymbol } from '../token/symbol';

interface GetLiquidityPoolProvisionsProps {
  client: PublicClient;
  poolId?: Address;
}
const getLiquidityPoolProvisions = async ({ client, poolId }: GetLiquidityPoolProvisionsProps) => {
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
    args: { poolId },
    fromBlock: block - 10000n,
  });

  return res;
};
interface GetFormattedLiquidityPoolProvisionsProps {
  client: PublicClient;
  data: {
    args: {
      poolId?: Address | undefined;
      liquidityProvider?: Address | undefined;
      tokens?: readonly Address[] | undefined;
      deltas?: readonly bigint[] | undefined;
      protocolFeeAmounts?: readonly bigint[] | undefined;
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
const getFormattedLiquidityPoolProvisions = async ({
  client,
  data,
}: GetFormattedLiquidityPoolProvisionsProps) => {
  const { args, blockHash, txHash } = data;
  const { deltas, liquidityProvider, poolId, tokens: tokenAddresses } = args;

  const type = deltas?.every(delta => delta >= 0) ? 'deposit' : 'withdraw';

  const tokenSymbolPromises = tokenAddresses?.map(address => getTokenSymbol(client, address));
  const tokenSymbols = await Promise.all(tokenSymbolPromises ?? []);

  // const tokens =
  //   tokenAddresses?.map((address, idx) => ({
  //     address,
  //     symbol: tokenSymbols?.[idx],
  //     amount: Math.abs(Number(formatUnits(deltas?.[idx] ?? 0n, TOKEN_DECIAML))),
  //   })) ?? [];

  const tokens: SwapTokenInfo[] = [];

  for (let i = 0; i < tokenSymbols.length; i++) {
    const address = tokenAddresses?.[i] ?? '0x0';
    const name = tokenSymbols?.[i];
    const balance = Math.abs(Number(formatUnits(deltas?.[i] || 0n, TOKEN_DECIAML)));
    const price = await getRootNetworkTokenPrice(client, name);
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
  const time = Number(blockInfo?.timestamp ?? Date.now() / 1000) * 1000;

  return {
    type,
    poolId: poolId ?? '0x0',
    tokens,
    time,
    liquidityProvider,
    txHash,
  } as GetLiquidityPoolProvisions;
};

interface UseGetLiquidityPoolProvisionsProps {
  poolId?: Address;
  options?: UseQueryOptions;
}
export const useGetLiquidityPoolProvisions = ({
  poolId,
  options,
}: UseGetLiquidityPoolProvisionsProps) => {
  const client = usePublicClient();

  const { data: liquidityPoolProvisionsData } = useQuery(
    [...QUERY_KEYS.LIQUIIDITY_POOL.GET_PROVISIONS, poolId],
    () => getLiquidityPoolProvisions({ client, poolId }),
    {
      keepPreviousData: true,
      enabled: !!poolId && !!client,
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
