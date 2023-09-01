import { Address, isAddress } from 'viem';
import { useBalance } from 'wagmi';

import { CONTRACT_ADDRESS } from '~/constants';
import { TOKEN } from '~/types/contracts';
import { formatNumber } from '~/utils/number';

interface Balance {
  value: string;
  symbol: string;
  decimals: number;
  rawValue: bigint;
}

export const useNativeTokenBalances = (address?: Address, decimals?: number): Balance => {
  const enabled = isAddress(address ?? '0x');

  const { data } = useBalance({
    address: address ?? '0x',
    enabled,
  });

  const formatted = formatNumber(data?.formatted, decimals);

  return {
    value: formatted,
    rawValue: data?.value ?? 0n,
    decimals: data?.decimals ?? 0,
    symbol: data?.symbol ?? '',
  };
};

export const useTokenBalances = (
  address?: Address,
  token?: Address,
  decimals?: number
): Balance => {
  const enabled = isAddress(address ?? '0x') && isAddress(token ?? '0x');

  const { data } = useBalance({
    address: address ?? '0x',
    token: token ?? '0x',
    enabled,
  });

  const formatted = formatNumber(data?.formatted, decimals);

  return {
    value: formatted,
    rawValue: data?.value ?? 0n,
    decimals: data?.decimals ?? 0,
    symbol: data?.symbol ?? '',
  };
};

export const useGetBalancesAll = (address?: Address) => {
  const enabled = isAddress(address ?? '0x');

  const { data: moaiData, status: moaiStatus } = useBalance({
    address,
    token: CONTRACT_ADDRESS[TOKEN.MOAI],
    enabled,
  });
  const { data: usdcData, status: usdcStatus } = useBalance({
    address,
    token: CONTRACT_ADDRESS[TOKEN.USDC],
    enabled,
  });
  const { data: usdtData, status: usdtStatus } = useBalance({
    address,
    token: CONTRACT_ADDRESS[TOKEN.USDT],
    enabled,
  });
  const { data: wethData, status: wethStatus } = useBalance({
    address,
    token: CONTRACT_ADDRESS[TOKEN.WETH],
    enabled,
  });

  if (
    moaiStatus === 'success' &&
    usdcStatus === 'success' &&
    usdtStatus === 'success' &&
    wethStatus === 'success'
  ) {
    return {
      [TOKEN.MOAI]: {
        value: moaiData?.formatted,
        rawValue: moaiData?.value ?? 0n,
        decimals: moaiData?.decimals ?? 0,
        symbol: moaiData?.symbol ?? '',
      },
      [TOKEN.USDC]: {
        value: usdcData?.formatted,
        rawValue: usdcData?.value ?? 0n,
        decimals: usdcData?.decimals ?? 0,
        symbol: usdcData?.symbol ?? '',
      },
      [TOKEN.USDT]: {
        value: usdtData?.formatted,
        rawValue: usdtData?.value ?? 0n,
        decimals: usdtData?.decimals ?? 0,
        symbol: usdtData?.symbol ?? '',
      },
      [TOKEN.WETH]: {
        value: wethData?.formatted,
        rawValue: wethData?.value ?? 0n,
        decimals: wethData?.decimals ?? 0,
        symbol: wethData?.symbol ?? '',
      },
    };
  }
  return {};
};
