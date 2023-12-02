import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Chain } from 'wagmi';

import { getNetworkFull } from '~/utils';
import { useSelecteNetworkStore } from '~/states/data';
import { NETWORK } from '~/types';

import { theRootNetwork, xrpEvmSidechain } from '~/configs/evm-network';

export const useEvm = () => {
  const [chains, setChains] = useState<Chain[]>([theRootNetwork, xrpEvmSidechain]);
  const [chainId, setChainId] = useState<number>(0);

  const { network } = useParams();
  const { selectedNetwork } = useSelecteNetworkStore();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;

  useEffect(() => {
    const chain =
      currentNetwork === NETWORK.THE_ROOT_NETWORK
        ? [theRootNetwork, xrpEvmSidechain]
        : currentNetwork === NETWORK.EVM_SIDECHAIN
        ? [theRootNetwork, xrpEvmSidechain]
        : [theRootNetwork, xrpEvmSidechain];

    const chainId = chain?.[0]?.id || 0;

    setChains(chain);
    setChainId(chainId);
  }, [currentNetwork]);

  return { chains, chainId };
};
