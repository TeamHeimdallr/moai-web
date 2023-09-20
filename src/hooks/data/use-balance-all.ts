import { formatEther, formatUnits, isAddress } from 'viem';
import { useBalance } from 'wagmi';

import { CHAIN, TOKEN_ADDRESS, TOKEN_USD_MAPPER } from '~/constants';
import { TOKEN, TokenBalanceInfoAll } from '~/types/contracts';

import { useConnectWallet } from './use-connect-wallet';
import { useGetRootPrice } from './use-root-price';

export const useBalancesAll = (): TokenBalanceInfoAll => {
  const { address } = useConnectWallet();
  const enableMantleLinea = (CHAIN === 'mantle' || CHAIN === 'linea') && isAddress(address ?? '0x');
  const enableRoot = CHAIN === 'root' && isAddress(address ?? '0x');
  const rootPrice = useGetRootPrice();

  const { data: moaiData } = useBalance({
    address,
    token: TOKEN_ADDRESS[TOKEN.MOAI],
    enabled: enableMantleLinea && !!TOKEN_ADDRESS[TOKEN.MOAI],
    scopeKey: 'moai',
  });

  const { data: usdcData } = useBalance({
    address,
    token: TOKEN_ADDRESS[TOKEN.USDC],
    enabled: enableMantleLinea && !!TOKEN_ADDRESS[TOKEN.USDC],
    scopeKey: 'usdc',
  });
  const { data: usdtData } = useBalance({
    address,
    token: TOKEN_ADDRESS[TOKEN.USDT],
    enabled: enableMantleLinea && !!TOKEN_ADDRESS[TOKEN.USDT],
    scopeKey: 'usdt',
  });
  const { data: wethData } = useBalance({
    address,
    token: TOKEN_ADDRESS[TOKEN.WETH],
    enabled: enableMantleLinea && !!TOKEN_ADDRESS[TOKEN.WETH],
    scopeKey: 'weth',
  });

  const { data: rootData } = useBalance({
    address,
    token: TOKEN_ADDRESS[TOKEN.ROOT],
    enabled: enableRoot && !!TOKEN_ADDRESS[TOKEN.ROOT],
    scopeKey: 'root',
  });

  const { data: xrpData } = useBalance({
    address,
    token: TOKEN_ADDRESS[TOKEN.XRP],
    enabled: enableRoot && !!TOKEN_ADDRESS[TOKEN.XRP],
    scopeKey: 'xrp',
  });

  const success = enableRoot ? rootData && xrpData : moaiData && usdcData && usdtData && wethData;

  if (!success)
    return {
      balancesMap: undefined,
      balancesArray: undefined,
    };

  const moai = {
    value: Number(formatEther(moaiData?.value ?? 0n)),
    valueUSD:
      Number(formatEther(moaiData?.value ?? 0n)) * (TOKEN_USD_MAPPER[moaiData?.symbol ?? ''] ?? 0),
    symbol: moaiData?.symbol ?? '',
  };
  const usdc = {
    value: Number(formatEther(usdcData?.value ?? 0n)),
    valueUSD:
      Number(formatEther(usdcData?.value ?? 0n)) * (TOKEN_USD_MAPPER[usdcData?.symbol ?? ''] ?? 0),
    symbol: usdcData?.symbol ?? '',
  };
  const usdt = {
    value: Number(formatEther(usdtData?.value ?? 0n)),
    valueUSD:
      Number(formatEther(usdtData?.value ?? 0n)) * (TOKEN_USD_MAPPER[usdtData?.symbol ?? ''] ?? 0),
    symbol: usdtData?.symbol ?? '',
  };
  const weth = {
    value: Number(formatEther(wethData?.value ?? 0n)),
    valueUSD:
      Number(formatEther(wethData?.value ?? 0n)) * (TOKEN_USD_MAPPER[wethData?.symbol ?? ''] ?? 0),
    symbol: wethData?.symbol ?? '',
  };
  const root = {
    value: Number(formatUnits(rootData?.value ?? 0n, rootData?.decimals ?? 6)),
    valueUSD:
      Number(formatUnits(rootData?.value ?? 0n, rootData?.decimals ?? 6)) * (rootPrice ?? 0),
    symbol: rootData?.symbol ?? '',
  };
  const xrp = {
    value: Number(formatUnits(xrpData?.value ?? 0n, xrpData?.decimals ?? 6)),
    valueUSD:
      Number(formatUnits(xrpData?.value ?? 0n, xrpData?.decimals ?? 6)) *
      (TOKEN_USD_MAPPER[xrpData?.symbol ?? ''] ?? 0),
    symbol: xrpData?.symbol ?? '',
  };

  const balancesMap = {
    [TOKEN.MOAI]: moai,
    [TOKEN.USDC]: usdc,
    [TOKEN.USDT]: usdt,
    [TOKEN.WETH]: weth,
    [TOKEN.ROOT]: root,
    [TOKEN.XRP]: xrp,
  };

  const balancesArray = [moai, usdc, usdt, weth, root, xrp];

  return {
    balancesMap,
    balancesArray,
  };
};
