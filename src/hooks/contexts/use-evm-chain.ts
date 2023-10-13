import { useMemo } from 'react';
import { Chain } from 'wagmi';

import { IS_MAINNET } from '~/constants';

import { useSelecteNetworkStore } from '~/states/data';
import { NETWORK } from '~/types';

import { theRootNetworkTestnet, xrpEvmSidechainTestnet } from '~/configs/evm-network';

export const useEvmChain = () => {
  const { selectedNetwork } = useSelecteNetworkStore();

  const chains: Chain[] = useMemo(() => {
    if (selectedNetwork === NETWORK.THE_ROOT_NETWORK) {
      return IS_MAINNET ? [] : [theRootNetworkTestnet];
    }
    if (selectedNetwork === NETWORK.EVM_SIDECHAIN) {
      return IS_MAINNET ? [] : [xrpEvmSidechainTestnet];
    }
    return [];
  }, [selectedNetwork]);

  const chainId = chains?.[0]?.id ?? 0;

  return { chains, chainId };
};
