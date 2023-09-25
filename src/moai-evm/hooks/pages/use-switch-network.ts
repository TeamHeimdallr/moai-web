import { useEffect } from 'react';
import { useNetwork } from 'wagmi';

import { useSwitchNetworkStore } from '~/states/pages/switch-network';

import { CHAIN_ID } from '~/moai-evm/constants';

export const useSwitchNetwork = (chainId: number = CHAIN_ID) => {
  const { needSwitchNetwork, setNeedSwitchNetwork, reset } = useSwitchNetworkStore();

  const { chain } = useNetwork();

  useEffect(() => {
    if (!chain || chain.id === chainId) setNeedSwitchNetwork(false);
    else setNeedSwitchNetwork(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain, chainId]);

  return {
    chainId,
    needSwitchNetwork,
    setNeedSwitchNetwork,
    reset,
  };
};
