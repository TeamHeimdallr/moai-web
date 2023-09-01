import { formatEther, isAddress } from 'viem';
import { useBalance } from 'wagmi';

import { CONTRACT_ADDRESS, TOKEN_USD_MAPPER } from '~/constants';
import { TOKEN, TokenBalanceInfoAll } from '~/types/contracts';

import { useConnectWallet } from './use-connect-wallet';

export const useBalancesAll = (): TokenBalanceInfoAll => {
  const { address } = useConnectWallet();
  const enabled = isAddress(address ?? '0x');

  const { data: moaiData } = useBalance({
    address,
    token: CONTRACT_ADDRESS[TOKEN.MOAI],
    enabled,
  });
  const { data: usdcData } = useBalance({
    address,
    token: CONTRACT_ADDRESS[TOKEN.USDC],
    enabled,
  });
  const { data: usdtData } = useBalance({
    address,
    token: CONTRACT_ADDRESS[TOKEN.USDT],
    enabled,
  });
  const { data: wethData } = useBalance({
    address,
    token: CONTRACT_ADDRESS[TOKEN.WETH],
    enabled,
  });

  const success = moaiData && usdcData && usdtData && wethData;

  if (!success)
    return {
      balancesMap: undefined,
      balancesArray: undefined,
    };

  const moai = {
    value: Number(formatEther(moaiData.value)),
    valueUSD: Number(formatEther(moaiData.value)) * (TOKEN_USD_MAPPER[moaiData.symbol] ?? 0),
    symbol: moaiData.symbol,
  };
  const usdc = {
    value: Number(formatEther(usdcData.value)),
    valueUSD: Number(formatEther(usdcData.value)) * (TOKEN_USD_MAPPER[usdcData.symbol] ?? 0),
    symbol: usdcData.symbol,
  };
  const usdt = {
    value: Number(formatEther(usdtData.value)),
    valueUSD: Number(formatEther(usdtData.value)) * (TOKEN_USD_MAPPER[usdtData.symbol] ?? 0),
    symbol: usdtData.symbol,
  };
  const weth = {
    value: Number(formatEther(wethData.value)),
    valueUSD: Number(formatEther(wethData.value)) * (TOKEN_USD_MAPPER[wethData.symbol] ?? 0),
    symbol: wethData.symbol,
  };
  const balancesMap = {
    [TOKEN.MOAI]: moai,
    [TOKEN.USDC]: usdc,
    [TOKEN.USDT]: usdt,
    [TOKEN.WETH]: weth,
  };

  const balancesArray = [moai, usdc, usdt, weth];

  return {
    balancesMap,
    balancesArray,
  };
};
