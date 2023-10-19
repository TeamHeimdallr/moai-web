import { useParams } from 'react-router-dom';
import { Address, PublicClient, useContractRead } from 'wagmi';

import { EVM_CONTRACT_ADDRESS, EVM_POOL, EVM_TOKEN_ADDRESS, TOKEN_PRICE } from '~/constants';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { getNetworkFull } from '~/utils';
import { NETWORK } from '~/types';

import { BALANCER_VAULT_ABI } from '~/abi';

// TODO: connect to server. get calculated token price in pool
export const getTokenPrice = async (client: PublicClient, network: NETWORK, symbol: string) => {
  const isEvm = network === NETWORK.THE_ROOT_NETWORK || network === NETWORK.EVM_SIDECHAIN;
  if (!isEvm) return 0;

  const tokenAddress =
    network === NETWORK.THE_ROOT_NETWORK
      ? EVM_TOKEN_ADDRESS?.[network]?.WETH_XRP
      : EVM_TOKEN_ADDRESS?.[network]?.ROOT_XRP;

  if (!tokenAddress || !client) return 0;

  const data = await client.readContract({
    address: EVM_CONTRACT_ADDRESS[network].VAULT as Address,
    abi: BALANCER_VAULT_ABI,
    functionName: 'getPoolTokens',
    args: [EVM_POOL[network]?.[0]],
  });

  const tokenPrice = data
    ? Number((TOKEN_PRICE.XRP * Number(data?.[1]?.[1] ?? 0)) / Number(data?.[1]?.[0] ?? 1) || 0)
    : 0;

  const price =
    symbol.toLowerCase() === 'root' || symbol.toLowerCase() === 'weth'
      ? tokenPrice
      : TOKEN_PRICE[symbol ?? ''] || 0;

  return price;
};

// TODO: connect to server. get calculated token price in pool
export const useTokenPrice = () => {
  const { network } = useParams();
  const { selectedNetwork, isEvm } = useNetwork();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const chainId = useNetworkId(currentNetwork);

  const tokenAddress = EVM_POOL?.[currentNetwork]?.[0]?.id;

  const address = EVM_CONTRACT_ADDRESS[currentNetwork]?.VAULT as Address;
  const { data } = useContractRead({
    address,
    abi: BALANCER_VAULT_ABI,
    functionName: 'getPoolTokens',
    chainId,
    args: [tokenAddress],
    enabled: !!address && !!tokenAddress && isEvm,
  });

  const price = data
    ? Number((TOKEN_PRICE.XRP * Number(data?.[1]?.[1] ?? 0)) / Number(data?.[1]?.[0] ?? 1) || 0)
    : 0;

  const getTokenPrice = (name?: string) => {
    if (name?.toLowerCase() === 'weth' || name?.toLowerCase() === 'root') return price;

    return (TOKEN_PRICE?.[name || ''] as number) || 0;
  };

  return {
    price,
    getTokenPrice,
  };
};
