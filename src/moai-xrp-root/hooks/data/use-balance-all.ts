import { formatUnits, isAddress } from 'viem';
import { useBalance } from 'wagmi';

import { TOKEN_ADDRESS, TOKEN_USD_MAPPER } from '~/moai-xrp-root/constants';

import { TOKEN, TokenBalanceInfoAll } from '~/moai-xrp-root/types/contracts';

import { useConnectWallet } from './use-connect-wallet';
import { useGetRootNetworkTokenPrice } from './use-root-network-token-price';

export const useBalancesAll = (): TokenBalanceInfoAll => {
  const { address } = useConnectWallet();
  const enabled = address && isAddress(address);

  const { rootPrice } = useGetRootNetworkTokenPrice();

  const { data: rootData } = useBalance({
    address,
    token: TOKEN_ADDRESS[TOKEN.ROOT],
    enabled: enabled && !!TOKEN_ADDRESS[TOKEN.ROOT],
    scopeKey: 'root',
  });

  const { data: xrpData } = useBalance({
    address,
    token: TOKEN_ADDRESS[TOKEN.XRP],
    enabled: enabled && !!TOKEN_ADDRESS[TOKEN.XRP],
    scopeKey: 'xrp',
  });

  const success = rootData && xrpData;

  if (!success)
    return {
      balancesMap: undefined,
      balancesArray: undefined,
    };

  const root = {
    balance: Number(formatUnits(rootData?.value ?? 0n, rootData?.decimals ?? 6)),
    value: Number(formatUnits(rootData?.value ?? 0n, rootData?.decimals ?? 6)) * (rootPrice ?? 0),
    name: rootData?.symbol ?? '',
  };
  const xrp = {
    balance: Number(formatUnits(xrpData?.value ?? 0n, xrpData?.decimals ?? 6)),
    value:
      Number(formatUnits(xrpData?.value ?? 0n, xrpData?.decimals ?? 6)) *
      (TOKEN_USD_MAPPER[xrpData?.symbol ?? ''] ?? 0),
    name: xrpData?.symbol ?? '',
  };

  const balancesMap = {
    [TOKEN.ROOT]: root,
    [TOKEN.XRP]: xrp,
  };

  const balancesArray = [root, xrp];

  return {
    balancesMap,
    balancesArray,
  };
};
