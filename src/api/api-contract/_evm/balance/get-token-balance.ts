import { Address, isAddress } from 'viem';
import { useBalance } from 'wagmi';

import { useNetwork } from '~/hooks/contexts/use-network';
import { formatNumber } from '~/utils/util-number';
interface Balance {
  value: string;
  symbol: string;
  decimals: number;
  rawValue: bigint;
}

export const useNativeTokenBalances = (address?: Address, decimals?: number): Balance => {
  const { isEvm } = useNetwork();

  const { data } = useBalance({
    address: address ?? '0x0',
    enabled: isEvm && isAddress(address ?? ''),
  });

  const formatted = formatNumber(data?.formatted, decimals);

  return {
    value: formatted,
    rawValue: data?.value ?? 0n,
    decimals: data?.decimals ?? 0,
    symbol: data?.symbol ?? '',
  };
};

export const useERC20TokenBalances = (
  address?: Address,
  token?: Address,
  decimals?: number
): Balance => {
  const { isEvm } = useNetwork();
  const enabled =
    isEvm && !!address && !!token && isAddress(address ?? '0x0') && isAddress(token ?? '0x0');

  const { data } = useBalance({
    address: address ?? '0x0',
    token: token ?? '0x0',
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
