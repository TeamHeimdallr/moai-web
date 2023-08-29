import { Address, isAddress } from 'viem';
import { useBalance } from 'wagmi';

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
