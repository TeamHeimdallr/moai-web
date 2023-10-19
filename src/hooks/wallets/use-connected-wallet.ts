import crossmarkSdk from '@crossmarkio/sdk';
import { SignAndSubmitFullResponse } from '@crossmarkio/sdk/dist/src/typings/crossmark/models';
import { AllTransactionRequest } from '@crossmarkio/sdk/dist/src/typings/crossmark/models/common/tx';
import {
  submitTransaction as gemSubmitTransaction,
  SubmitTransactionRequest,
  SubmitTransactionResponse,
} from '@gemwallet/api';

import { useConnectWithCrossmarkWallet, useConnectWithEvmWallet, useConnectWithGemWallet } from '.';

interface ConnectedWallet {
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  connectedConnector: string;
  address: string;
  truncatedAddress: string;
}

interface UseConnectedWallet {
  evm: ConnectedWallet;
  xrp: ConnectedWallet & {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    submitTransaction: (tx: any) => Promise<any>;
  };
}
export const useConnectedWallet = (): UseConnectedWallet => {
  const {
    isConnected: isEvmConnected,
    connect: connectEvm,
    disconnect: disconnectEvm,
    connectedConnector: connectedEvmConnector,
    address: evmAddress,
    truncatedAddress: truncatedEvmAddress,
  } = useConnectWithEvmWallet();

  const {
    isConnected: isXrpCrossmarkConnected,
    connect: connectXrpCrossmark,
    disconnect: disconnectXrpCrossmark,
    address: xrpCrossmarkAddress,
    truncatedAddress: truncatedXrpCrossmarkAddress,
  } = useConnectWithCrossmarkWallet();

  const {
    isConnected: isXrpGemConnected,
    connect: connectXrpGem,
    disconnect: disconnectXrpGem,
    address: xrpGemAddress,
    truncatedAddress: truncatedXrpGemAddress,
  } = useConnectWithGemWallet();

  const xrp = isXrpCrossmarkConnected
    ? {
        isConnected: isXrpCrossmarkConnected,
        connect: connectXrpCrossmark,
        disconnect: disconnectXrpCrossmark,
        address: xrpCrossmarkAddress,
        truncatedAddress: truncatedXrpCrossmarkAddress,
        connectedConnector: 'crossmark',
        submitTransaction: async (tx: AllTransactionRequest) =>
          (await crossmarkSdk.signAndSubmitAndWait(tx)) as SignAndSubmitFullResponse,
      }
    : {
        isConnected: isXrpGemConnected,
        connect: connectXrpGem,
        disconnect: disconnectXrpGem,
        address: xrpGemAddress,
        truncatedAddress: truncatedXrpGemAddress,
        connectedConnector: 'gem',
        submitTransaction: async (tx: SubmitTransactionRequest) =>
          (await gemSubmitTransaction(tx)) as SubmitTransactionResponse,
      };

  const evm = {
    isConnected: isEvmConnected,
    connect: connectEvm,
    disconnect: disconnectEvm,
    connectedConnector: connectedEvmConnector,
    address: evmAddress,
    truncatedAddress: truncatedEvmAddress,
  };

  return {
    evm,
    xrp,
  };
};
