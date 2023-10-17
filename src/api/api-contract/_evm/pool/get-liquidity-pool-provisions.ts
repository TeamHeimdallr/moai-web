import { useQueries, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { formatUnits } from 'viem';
import { Address, PublicClient, usePublicClient } from 'wagmi';

import { QUERY_KEYS } from '~/api/utils/query-keys';

import { EVM_CONTRACT_ADDRESS, TOKEN_DECIMAL } from '~/constants';

import { useNetwork } from '~/hooks/contexts/use-network';
import { NETWORK } from '~/types';

import { getTokenPrice } from '../token/price';
import { getTokenSymbol } from '../token/symbol';

// TODO: change to server api
interface GetLiquidityPoolProvisionsProps {
  client: PublicClient;
  network: NETWORK;
  poolId: Address;
}
const getLiquidityPoolProvisions = async ({
  client,
  network,
  poolId,
}: GetLiquidityPoolProvisionsProps) => {
  const isEvm = network === NETWORK.THE_ROOT_NETWORK || network === NETWORK.EVM_SIDECHAIN;
  if (!isEvm) return;

  const block = await client.getBlockNumber();

  const res = await client.getLogs({
    address: EVM_CONTRACT_ADDRESS[network].VAULT as Address,
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
  network: NETWORK;
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
interface PoolTokenInfo {
  address: Address;
  name: string;
  balance: number;
  price: number;
  value: number;
}
const getFormattedLiquidityPoolProvisions = async ({
  client,
  network,
  data,
}: GetFormattedLiquidityPoolProvisionsProps) => {
  const isEvm = network === NETWORK.THE_ROOT_NETWORK || network === NETWORK.EVM_SIDECHAIN;
  if (!isEvm) return;

  const { args, blockHash, txHash } = data;
  const { deltas, liquidityProvider, poolId, tokens: tokenAddresses } = args;

  const type = deltas?.every(delta => delta >= 0) ? 'deposit' : 'withdraw';

  const tokenSymbolPromises = tokenAddresses?.map(address => getTokenSymbol(client, address));
  const tokenSymbols = await Promise.all(tokenSymbolPromises ?? []);

  const tokens: PoolTokenInfo[] = [];

  for (let i = 0; i < tokenSymbols.length; i++) {
    const address = tokenAddresses?.[i] ?? '0x0';
    const name = tokenSymbols?.[i];
    const balance = Math.abs(Number(formatUnits(deltas?.[i] || 0n, TOKEN_DECIMAL[network])));
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
  const time = Number(blockInfo?.timestamp ?? Date.now() / 1000) * 1000;

  return {
    type,
    poolId: poolId ?? '0x0',
    tokens,
    time,
    liquidityProvider,
    txHash,
  };
};

interface UseGetLiquidityPoolProvisionsProps {
  poolId: Address;
  options?: UseQueryOptions;
}
export const useGetLiquidityPoolProvisions = ({
  poolId,
  options,
}: UseGetLiquidityPoolProvisionsProps) => {
  const client = usePublicClient();
  const { selectedNetwork, isEvm } = useNetwork();

  const { data: liquidityPoolProvisionsData } = useQuery(
    [...QUERY_KEYS.LIQUIIDITY_POOL.GET_PROVISIONS, poolId],
    () => getLiquidityPoolProvisions({ client, network: selectedNetwork, poolId }),
    {
      keepPreviousData: true,
      enabled: !!poolId && !!client && isEvm,
      staleTime: 1000 * 5,
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
          network: selectedNetwork,
          data: { args: data.args, blockHash: data.blockHash, txHash: data.transactionHash },
        }),
      staleTime: 1000 * 5,
      enabled: isEvm,
    })) ?? [];
  const data = useQueries({ queries });

  return {
    data: data?.map(query => query.data) ?? [],
    isLoading: data?.some(query => query.isLoading) ?? false,
    isError: data?.some(query => query.isError) ?? false,
    isSuccess: data?.every(query => query.isSuccess) ?? false,
  };
};
