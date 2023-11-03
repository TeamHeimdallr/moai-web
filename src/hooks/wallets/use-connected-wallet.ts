import crossmarkSdk from '@crossmarkio/sdk';
import { SignAndSubmitFullResponse } from '@crossmarkio/sdk/dist/src/typings/crossmark/models';
import { AllTransactionRequest } from '@crossmarkio/sdk/dist/src/typings/crossmark/models/common/tx';
import {
  submitTransaction as gemSubmitTransaction,
  SubmitTransactionResponse,
} from '@gemwallet/api';
import { zeroAddress } from 'viem';
import { Transaction } from 'xrpl';

import { truncateAddress } from '~/utils/util-string';
import { NETWORK } from '~/types';

import { useFuturepassOf } from './use-futurepass-of';
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
  fpass: ConnectedWallet & {
    signer: string; // owner
    refetch: () => void;
  };

  currentAddress: string | undefined;
}
export const useConnectedWallet = (network?: NETWORK): UseConnectedWallet => {
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
        submitTransaction: async (tx: Transaction) =>
          (await gemSubmitTransaction({ transaction: tx })) as SubmitTransactionResponse,
      };

  const evm = {
    isConnected: isEvmConnected,
    connect: connectEvm,
    disconnect: disconnectEvm,
    connectedConnector: connectedEvmConnector,
    address: evmAddress,
    truncatedAddress: truncatedEvmAddress,
  };

  const { data, refetch } = useFuturepassOf({ enabled: !!evmAddress });

  const fpass = {
    isConnected: isEvmConnected,
    connect: connectEvm,
    disconnect: disconnectEvm,
    connectedConnector: connectedEvmConnector,
    address: data === zeroAddress ? '' : data ?? '',
    truncatedAddress: data === zeroAddress ? '' : truncateAddress(data),
    signer: evmAddress,
    refetch,
  };

  const currentAddress =
    network === NETWORK.THE_ROOT_NETWORK
      ? fpass?.address
      : network === NETWORK.EVM_SIDECHAIN
      ? evm?.address
      : xrp?.address;

  return {
    evm,
    xrp,
    fpass,

    currentAddress,
  };
};
