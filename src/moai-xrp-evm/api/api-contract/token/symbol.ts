import { Abi, Address, isAddress, PublicClient } from 'viem';
import { useContractReads } from 'wagmi';

import { TOKEN_ABI } from '~/moai-xrp-evm/abi/token';

export const getTokenSymbol = async (client: PublicClient, address: Address) => {
  if (!isAddress(address) || address === '0x0') return '';

  const symbol = await client.readContract({
    address,
    abi: TOKEN_ABI,
    functionName: 'symbol',
  });

  return ((symbol as string) || '') === 'WXRP' ? 'XRP' : (symbol as string) || '';
};

interface QueryOptions {
  enabled?: boolean;
}
export const useTokenSymbols = (addresses: Address[], options?: QueryOptions) => {
  const { enabled } = options ?? {};

  const { data: _data, ...rest } = useContractReads({
    contracts: addresses.map(address => ({
      address,
      abi: TOKEN_ABI as Abi,
      functionName: 'symbol',
      enabled,
    })),
  });
  return {
    data:
      _data?.map(d => ((d?.result ?? '') === 'WXRP' ? 'XRP' : ((d?.result ?? '') as string))) ?? [],
    ...rest,
  };
};
