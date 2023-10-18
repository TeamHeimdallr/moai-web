import { Address, PublicClient, useContractRead } from 'wagmi';

import { EVM_CONTRACT_ADDRESS, EVM_POOL, EVM_TOKEN_ADDRESS, TOKEN_PRICE } from '~/constants';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
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
  const { selectedNetwork, isEvm } = useNetwork();
  const { evm } = useConnectedWallet();
  const { address: walletAddress } = evm;

  const tokenAddress =
    selectedNetwork === NETWORK.THE_ROOT_NETWORK
      ? EVM_TOKEN_ADDRESS?.[selectedNetwork]?.WETH_XRP
      : EVM_TOKEN_ADDRESS?.[selectedNetwork]?.ROOT_XRP;

  const { data } = useContractRead({
    address: EVM_CONTRACT_ADDRESS[selectedNetwork].VAULT as Address,
    abi: BALANCER_VAULT_ABI,
    functionName: 'getPoolTokens',
    args: [tokenAddress],
    enabled: !!walletAddress || isEvm,
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
