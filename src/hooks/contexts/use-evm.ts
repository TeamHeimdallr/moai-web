import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Chain } from 'wagmi';

import { IS_MAINNET } from '~/constants';

import { getNetworkFull } from '~/utils';
import { useSelecteNetworkStore } from '~/states/data';
import { NETWORK } from '~/types';

import { theRootNetworkTestnet, xrpEvmSidechainTestnet } from '~/configs/evm-network';

export const useEvm = () => {
  const [chains, setChains] = useState<Chain[]>([theRootNetworkTestnet, xrpEvmSidechainTestnet]);
  const [chainId, setChainId] = useState<number>(0);

  const { network } = useParams();
  const { selectedNetwork } = useSelecteNetworkStore();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;

  useEffect(() => {
    const chain =
      currentNetwork === NETWORK.THE_ROOT_NETWORK
        ? IS_MAINNET
          ? []
          : [theRootNetworkTestnet, xrpEvmSidechainTestnet]
        : currentNetwork === NETWORK.EVM_SIDECHAIN
        ? IS_MAINNET
          ? []
          : [xrpEvmSidechainTestnet, theRootNetworkTestnet]
        : [theRootNetworkTestnet, xrpEvmSidechainTestnet];

    const chainId = chain?.[0]?.id ?? 0;

    setChains(chain);
    setChainId(chainId);
  }, [currentNetwork]);

  return { chains, chainId };
};
