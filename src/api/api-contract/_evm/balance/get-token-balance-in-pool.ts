import { formatUnits } from 'viem';
import { Address, useBalance } from 'wagmi';

import { EVM_TOKEN_ADDRESS, TOKEN_PRICE } from '~/constants';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { ITokenbalanceInPool, NETWORK } from '~/types';

import { useTokenPrice } from '../token/price';

// TODO: change to get all balances. using fetchBalance in wagmi/core
export const useTokenBalanceInPool = (): ITokenbalanceInPool => {
  const { selectedNetwork, isEvm } = useNetwork();
  const { evm } = useConnectedWallet();
  const { getTokenPrice } = useTokenPrice();

  const { address } = evm;

  const tokenAddress =
    selectedNetwork === NETWORK.THE_ROOT_NETWORK
      ? EVM_TOKEN_ADDRESS?.[selectedNetwork]?.ROOT
      : EVM_TOKEN_ADDRESS?.[selectedNetwork]?.XRP;

  const { data: tokenData } = useBalance({
    address: address as Address,
    token: tokenAddress as Address,
    enabled: isEvm && !!address && !!tokenAddress,
  });

  const { data: xrpData } = useBalance({
    address: address as Address,
    token: EVM_TOKEN_ADDRESS?.[selectedNetwork]?.XRP as Address,
    enabled: isEvm && !!address && !!EVM_TOKEN_ADDRESS?.[selectedNetwork]?.XRP,
  });

  const success = tokenData !== undefined && xrpData !== undefined;

  if (!success)
    return {
      balancesMap: undefined,
      balancesArray: undefined,
    };

  const token = {
    balance: Number(formatUnits(tokenData?.value ?? 0n, tokenData?.decimals ?? 6)),
    value:
      Number(formatUnits(tokenData?.value ?? 0n, tokenData?.decimals ?? 6)) *
      (getTokenPrice(tokenData?.symbol) ?? 0),
    symbol: tokenData?.symbol ?? '',
  };
  const xrp = {
    balance: Number(formatUnits(xrpData?.value ?? 0n, xrpData?.decimals ?? 6)),
    value:
      Number(formatUnits(xrpData?.value ?? 0n, xrpData?.decimals ?? 6)) *
      (TOKEN_PRICE[xrpData?.symbol ?? ''] ?? 0),
    symbol: xrpData?.symbol ?? '',
  };

  const balancesMap = {
    TOKEN: token,
    XRP: xrp,
  };

  const balancesArray = [token, xrp];

  return {
    balancesMap,
    balancesArray,
  };
};
