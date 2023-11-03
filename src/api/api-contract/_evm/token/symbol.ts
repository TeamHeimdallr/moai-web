import { useParams } from 'react-router-dom';
import { Abi, Address, isAddress, PublicClient } from 'viem';
import { useContractReads } from 'wagmi';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { getNetworkFull } from '~/utils';
import { NETWORK } from '~/types';

import { ERC20_TOKEN_ABI } from '~/abi';

// TODO: change to fetchToken in wagmi/core
export const getTokenSymbol = async (client: PublicClient, network: NETWORK, address: Address) => {
  const isEvm = network === NETWORK.THE_ROOT_NETWORK || network === NETWORK.EVM_SIDECHAIN;
  if (!isEvm || !isAddress(address) || address === '0x0') return '';

  const symbol = await client.readContract({
    address,
    abi: ERC20_TOKEN_ABI,
    functionName: 'symbol',
  });

  return (symbol === 'WXRP' ? 'XRP' : (symbol as string)) || '';
};

export const useTokenSymbols = (addresses: Address[]) => {
  const { network } = useParams();
  const { selectedNetwork, isEvm } = useNetwork();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const chainId = useNetworkId(currentNetwork);

  const { data: res } = useContractReads({
    contracts: addresses.map(address => ({
      address,
      abi: ERC20_TOKEN_ABI as Abi,
      chainId,
      functionName: 'symbol',
      enabled: isEvm && !!address,
    })),
  });

  return {
    data: res?.map(d => (d?.result === 'WXRP' ? 'XRP' : d?.result ?? '') as string) ?? [],
  };
};
