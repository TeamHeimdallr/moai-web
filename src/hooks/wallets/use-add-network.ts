import { useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useWalletClient } from 'wagmi';

import { getNetworkFull } from '~/utils';
import { NETWORK } from '~/types';

import { theRootNetworkForAdd, xrpEvmSidechainForAdd } from '~/configs/evm-network';

import { useNetwork } from '../contexts/use-network';

export const useSwitchAndAddNetwork = () => {
  const { data: walletClient } = useWalletClient();

  const { network } = useParams();
  const { selectedNetwork } = useNetwork();
  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;

  const targetNetwork = useMemo(
    () =>
      currentNetwork === NETWORK.THE_ROOT_NETWORK ? theRootNetworkForAdd : xrpEvmSidechainForAdd,
    [currentNetwork]
  );

  const switchNetwork = useCallback(async () => {
    try {
      await walletClient?.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetNetwork.chainId }],
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await walletClient?.request({
            method: 'wallet_addEthereumChain',
            params: [targetNetwork],
          });
        } catch (addError) {
          // 네트워크 추가 Error 예외처리
        }
      }
      // 네트워크 전환 Error 예외처리
    }
  }, [targetNetwork, walletClient]);

  return { switchNetwork };
};
