import { PublicClient } from 'viem';
import { useContractRead } from 'wagmi';

import { useConnectEvmWallet } from '~/hooks/wallets/use-connect-evm-wallet';

import { VAULT_ABI } from '~/moai-xrp-root/abi/vault';

import { CONTRACT_ADDRESS, POOL_ID, TOKEN_USD_MAPPER } from '~/moai-xrp-root/constants';

export const getRootNetworkTokenPrice = async (client?: PublicClient, name?: string) => {
  if (!client || !name) {
    return 0;
  }

  const data = await client.readContract({
    address: CONTRACT_ADDRESS.VAULT,
    abi: VAULT_ABI,
    functionName: 'getPoolTokens',
    args: [POOL_ID.ROOT_XRP],
  });

  const rootPrice = data
    ? Number(
        (TOKEN_USD_MAPPER['XRP'] * Number(data?.[1]?.[1] ?? 0)) / Number(data?.[1]?.[0] ?? 1) || 0
      )
    : 0;

  const price = name?.toLowerCase() === 'root' ? rootPrice : TOKEN_USD_MAPPER[name ?? ''] ?? 0;

  return price;
};

export const useGetRootNetworkTokenPrice = () => {
  const { address } = useConnectEvmWallet();

  const { data } = useContractRead({
    address: CONTRACT_ADDRESS.VAULT,
    abi: VAULT_ABI,
    functionName: 'getPoolTokens',
    args: [POOL_ID.ROOT_XRP],
    staleTime: 1000 * 5,
    enabled: !!address,
  });

  const rootPrice = data
    ? Number(
        (TOKEN_USD_MAPPER['XRP'] * Number(data?.[1]?.[1] ?? 0)) / Number(data?.[1]?.[0] ?? 1) || 0
      )
    : 0;

  const getTokenPrice = (name?: string) => {
    if (name?.toLowerCase() === 'root') return rootPrice;
    return TOKEN_USD_MAPPER[name ?? ''] ?? 0;
  };

  return {
    rootPrice,
    getTokenPrice,
  };
};
