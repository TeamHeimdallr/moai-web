import { formatUnits, isAddress } from 'viem';
import { useBalance } from 'wagmi';

import { TOKEN_ADDRESS, TOKEN_USD_MAPPER } from '~/moai-xrp-evm/constants';

import { TOKEN, TokenBalanceInfoAll } from '~/moai-xrp-evm/types/contracts';

import { useConnectWallet } from './use-connect-wallet';

export const useBalancesAll = (): TokenBalanceInfoAll => {
  const { address } = useConnectWallet();
  const enabled = address && isAddress(address);

  const { data: wethData } = useBalance({
    address,
    token: TOKEN_ADDRESS[TOKEN.WETH],
    enabled: enabled && !!TOKEN_ADDRESS[TOKEN.WETH],
    scopeKey: 'weth',
  });

  const { data: xrpData } = useBalance({
    address,
    enabled: enabled,
    scopeKey: 'xrp',
  });

  const { data: wxrpData } = useBalance({
    address,
    token: TOKEN_ADDRESS[TOKEN.WXRP],
    enabled: enabled && !!TOKEN_ADDRESS[TOKEN.WXRP],
    scopeKey: 'wxrp',
  });

  const success = wethData && xrpData && wxrpData;

  if (!success)
    return {
      balancesMap: undefined,
      balancesArray: undefined,
    };

  const weth = {
    balance: Number(formatUnits(wethData?.value ?? 0n, wethData?.decimals ?? 18)),
    value:
      Number(formatUnits(wethData?.value ?? 0n, wethData?.decimals ?? 18)) *
      (TOKEN_USD_MAPPER[wethData?.symbol ?? ''] ?? 0),
    name: wethData?.symbol ?? '',
  };
  const xrp = {
    balance: Number(formatUnits(xrpData?.value ?? 0n, xrpData?.decimals ?? 6)),
    value:
      Number(formatUnits(xrpData?.value ?? 0n, xrpData?.decimals ?? 6)) *
      (TOKEN_USD_MAPPER[xrpData?.symbol ?? ''] ?? 0),
    name: xrpData?.symbol ?? '',
  };
  const wxrp = {
    balance: Number(formatUnits(wxrpData?.value ?? 0n, wxrpData?.decimals ?? 18)),
    value:
      Number(formatUnits(wxrpData?.value ?? 0n, wxrpData?.decimals ?? 18)) *
      (TOKEN_USD_MAPPER[wxrpData?.symbol ?? ''] ?? 0),
    name: wxrpData?.symbol ?? '',
  };

  const balancesMap = {
    [TOKEN.WETH]: weth,
    [TOKEN.XRP]: xrp,
    [TOKEN.WXRP]: wxrp,
  };

  const balancesArray = [weth, xrp, wxrp];

  return {
    balancesMap,
    balancesArray,
  };
};
