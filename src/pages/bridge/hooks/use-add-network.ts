import { useCallback, useMemo } from 'react';
import { useWalletClient } from 'wagmi';

import { ethereumForAdd, theRootNetworkForAdd } from '~/configs/evm-network';

import { useSelecteNetworkStore } from '../states';

export const useSwitchAndAddNetwork = () => {
  const { data: walletClient } = useWalletClient();

  const { from } = useSelecteNetworkStore();

  const targetNetwork = useMemo(
    () =>
      from === 'THE_ROOT_NETWORK'
        ? theRootNetworkForAdd
        : from === 'ETHEREUM'
        ? ethereumForAdd
        : '',
    [from]
  );

  const switchNetwork = useCallback(async () => {
    if (!targetNetwork) return;

    try {
      await walletClient?.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetNetwork?.chainId }],
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
