import { useEffect, useState } from 'react';
import { Address } from 'viem';
import { usePublicClient } from 'wagmi';

import { TOKEN_ABI } from '~/abi/token';

export const useTokenSymbol = (addresses: Address[]) => {
  const client = usePublicClient();
  const [symbols, setSymbols] = useState<string[]>([]);

  const getSymbol = async (address: Address) => {
    const symbol = await client.readContract({
      address,
      abi: TOKEN_ABI,
      functionName: 'symbol',
    });

    return symbol as string;
  };

  useEffect(() => {
    const fetch = async () => {
      const symbols = await Promise.all(addresses?.map(getSymbol) ?? []);
      setSymbols(symbols);
    };

    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addresses]);

  return symbols;
};
