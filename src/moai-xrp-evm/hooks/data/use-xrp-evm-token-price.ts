import { PublicClient } from 'viem';
import { useContractRead } from 'wagmi';

import { VAULT_ABI } from '~/moai-xrp-evm/abi/vault';

import { CONTRACT_ADDRESS, POOL_ID, TOKEN_USD_MAPPER } from '~/moai-xrp-evm/constants';

import { useConnectWallet } from './use-connect-wallet';

export const getXrpEvmTokenPrice = async (client?: PublicClient, name?: string) => {
  if (!client || !name) {
    return 0;
  }

  const data = await client.readContract({
    address: CONTRACT_ADDRESS.VAULT,
    abi: VAULT_ABI,
    functionName: 'getPoolTokens',
    args: [POOL_ID.WETH_XRP],
  });

  const wethPrice = data
    ? Number(
        (TOKEN_USD_MAPPER['XRP'] * Number(data?.[1]?.[1] ?? 0)) / Number(data?.[1]?.[0] ?? 1) || 0
      )
    : 0;

  const price = name?.toLowerCase() === 'weth' ? wethPrice : TOKEN_USD_MAPPER[name ?? ''] ?? 0;

  return price;
};

export const useGetXrpEvmTokenPrice = () => {
  const { address } = useConnectWallet();

  const { data } = useContractRead({
    address: CONTRACT_ADDRESS.VAULT,
    abi: VAULT_ABI,
    functionName: 'getPoolTokens',
    args: [POOL_ID.WETH_XRP],
    enabled: !!address,
  });

  const wethPrice = data
    ? Number(
        (TOKEN_USD_MAPPER['XRP'] * Number(data?.[1]?.[1] ?? 0)) / Number(data?.[1]?.[0] ?? 1) || 0
      )
    : 0;

  const getTokenPrice = (name?: string) => {
    if (name?.toLowerCase() === 'weth') return wethPrice;
    return TOKEN_USD_MAPPER[name ?? ''] ?? 0;
  };

  return {
    wethPrice,
    getTokenPrice,
  };
};
