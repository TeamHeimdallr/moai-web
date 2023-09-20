import { useContractRead } from 'wagmi';

import { VAULT_ABI } from '~/abi/vault';
import { CONTRACT_ADDRESS, POOL_ID, TOKEN_USD_MAPPER } from '~/constants';

export const useGetRootPrice = () => {
  const { data } = useContractRead({
    address: CONTRACT_ADDRESS.VAULT,
    abi: VAULT_ABI,
    functionName: 'getPoolTokens',
    args: [POOL_ID.ROOT_XRP],
    enabled: true,
  });

  if (data === undefined) return 0;
  return TOKEN_USD_MAPPER['XRP'] * Number((data?.[1]?.[0] ?? 0) / (data?.[1]?.[1] ?? 1));
};
