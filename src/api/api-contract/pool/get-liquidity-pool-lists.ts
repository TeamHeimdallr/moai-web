import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { PublicClient } from 'viem';
import { usePublicClient } from 'wagmi';

import { QUERY_KEYS } from '~/api/utils/query-keys';
import { CHAIN_ID, CONTRACT_ADDRESS, TOKEN_ADDRESS } from '~/constants';
import { CHAIN_ID as CHAIN_ID_LINEA } from '~/constants/constant-chain-linea';
import { CHAIN_ID as CHAIN_ID_MANTLE } from '~/constants/constant-chain-mantle';
import { CHAIN_ID as CHAIN_ID_ROOT } from '~/constants/constant-chain-root';

import { liquidityPoolLists, myLiquidityPoolLists } from './data/liquidity-pool-list';

export const useGetLiquidityPoolLists = () => {
  if (CHAIN_ID === CHAIN_ID_MANTLE || CHAIN_ID === CHAIN_ID_LINEA)
    return liquidityPoolLists.mantle_linea;
  if (CHAIN_ID === CHAIN_ID_ROOT) return liquidityPoolLists.root;

  return liquidityPoolLists.mantle_linea;
};

const getLogsRequest = async (client: PublicClient) =>
  await client.getLogs({
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
    // event: {
    //   type: 'event',
    //   name: 'Swap',
    //   inputs: [
    //     { type: 'bytes32', name: 'poolId', indexed: true },
    //     { type: 'address', name: 'tokenIn', indexed: true },
    //     { type: 'address', name: 'tokenOut', indexed: true },
    //     { type: 'uint256', name: 'amountIn', indexed: false },
    //     { type: 'uint256', name: 'amountOut', indexed: false },
    //   ],
    // },
    fromBlock: 0n,
  });

export const useGetMyLiquidityPoolLists = (options?: UseQueryOptions) => {
  const client = usePublicClient();
  // const { data } = useQuery(QUERY_KEYS.getMyLiquidityPoolLists, () => getLogsRequest(client), {
  //   keepPreviousData: true,
  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   ...(options as any),
  // });
  // console.log(data);

  if (CHAIN_ID === CHAIN_ID_MANTLE || CHAIN_ID === CHAIN_ID_LINEA)
    return myLiquidityPoolLists.mantle_linea;
  if (CHAIN_ID === CHAIN_ID_ROOT) return myLiquidityPoolLists.root;

  return myLiquidityPoolLists.mantle_linea;
};
