import crossmarkSdk from '@crossmarkio/sdk';
import {
  submitTransaction as gemSubmitTransaction,
  SubmitTransactionResponse,
} from '@gemwallet/api';
import { zeroAddress } from 'viem';
import { Transaction } from 'xrpl';

import { BLOCKCHAIN_ENV, IS_DEVNET } from '~/constants';

import { truncateAddress } from '~/utils/util-string';
import { useTheRootNetworkSwitchWalletStore } from '~/states/contexts/wallets/switch-wallet';
import { useXummWalletStore } from '~/states/contexts/wallets/xumm-wallet';
import { NETWORK } from '~/types';

import { useXrpl } from '../contexts';

import { useFuturepassOf } from './use-futurepass-of';
import {
  useConnectWithCrossmarkWallet,
  useConnectWithEvmWallet,
  useConnectWithGemWallet,
  useConnectWithXummWallet,
} from '.';

interface ConnectedWallet {
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  connectedConnector: string;
  address: string;
  truncatedAddress: string;
}

interface UseConnectedWallet {
  evm: ConnectedWallet & {
    isConnecting: boolean;
  };
  xrp: ConnectedWallet & {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    submitTransaction: (tx: any) => Promise<any>;
  };
  fpass: ConnectedWallet & {
    signer: string; // owner
    refetch: () => void;
  };

  anyAddress: string | undefined;
  currentAddress: string | undefined;
}
export const useConnectedWallet = (network?: NETWORK): UseConnectedWallet => {
  const { selectedWallet: selectedWalletTRN } = useTheRootNetworkSwitchWalletStore();

  const { evm, fpass } = useConnectedEvmWallet();
  const xrp = useConnectedXrplWallet();

  const anyAddress = xrp?.address || evm?.address || fpass?.address;
  const currentAddress =
    network === NETWORK.THE_ROOT_NETWORK
      ? selectedWalletTRN === 'fpass'
        ? fpass?.address
        : evm?.address
      : network === NETWORK.EVM_SIDECHAIN
      ? evm?.address
      : xrp?.address;

  return {
    evm,
    xrp,
    fpass,

    anyAddress,
    currentAddress,
  };
};

export const useConnectedEvmWallet = () => {
  const {
    isConnected: isEvmConnected,
    isConnecting: isEvmConnecting,
    connect: connectEvm,
    disconnect: disconnectEvm,
    connectedConnector: connectedEvmConnector,
    address: evmAddress,
    truncatedAddress: truncatedEvmAddress,
  } = useConnectWithEvmWallet();

  const evm = {
    isConnected: isEvmConnected,
    isConnecting: isEvmConnecting,
    connect: connectEvm,
    disconnect: disconnectEvm,
    connectedConnector: connectedEvmConnector,
    address: evmAddress,
    truncatedAddress: truncatedEvmAddress,
  };

  const { data, refetch } = useFuturepassOf({ enabled: !!evmAddress });

  const fpass = {
    isConnected: isEvmConnected,
    isConnecting: isEvmConnecting,
    connect: connectEvm,
    disconnect: disconnectEvm,
    connectedConnector: connectedEvmConnector,
    address: data === zeroAddress ? '' : data ?? '',
    truncatedAddress: data === zeroAddress ? '' : truncateAddress(data),
    signer: evmAddress,
    refetch,
  };

  return { evm, fpass };
};

export const useConnectedXrplWallet = () => {
  const { client: xummWalletClient } = useXummWalletStore();
  const { client: xrplClient } = useXrpl();

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

  const {
    isConnected: isXrpXummConnected,
    connect: connectXrpXumm,
    disconnect: disconnectXrpXumm,
    address: xrpXummAddress,
    truncatedAddress: truncatedXrpXummAddress,
  } = useConnectWithXummWallet();

  const xrp = isXrpXummConnected
    ? {
        isConnected: isXrpXummConnected,
        connect: connectXrpXumm,
        disconnect: disconnectXrpXumm,
        address: xrpXummAddress,
        truncatedAddress: truncatedXrpXummAddress,
        connectedConnector: 'xumm',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        submitTransaction: (tx: any) =>
          new Promise((resolve, reject) => {
            if (!xummWalletClient) return;

            let popup: Window | null;
            xummWalletClient.payload
              .createAndSubscribe(
                { txjson: tx, options: { force_network: IS_DEVNET ? 'testnet' : BLOCKCHAIN_ENV } },
                e => {
                  if (typeof e.data.signed === 'undefined') return;

                  if (e.data.signed === false) {
                    popup?.close();
                    reject();
                  }

                  xrplClient
                    .request({
                      command: 'tx',
                      transaction: e.data.txid,
                      binary: false,
                    })
                    .then(res => {
                      popup?.close();
                      resolve(res?.result || e.data);
                    })
                    .catch(() => {
                      popup?.close();
                      resolve(e.data);
                    });
                }
              )
              .then(res => {
                popup = window.open(
                  res.created.next.always,
                  '_blank',
                  'width=700, height=600, top=50, left=50, scrollbars=yes'
                );
              });
          }),
      }
    : isXrpCrossmarkConnected
    ? {
        isConnected: isXrpCrossmarkConnected,
        connect: connectXrpCrossmark,
        disconnect: disconnectXrpCrossmark,
        address: xrpCrossmarkAddress,
        truncatedAddress: truncatedXrpCrossmarkAddress,
        connectedConnector: 'crossmark',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        submitTransaction: async (tx: any) => await crossmarkSdk.signAndSubmitAndWait(tx),
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

  return xrp;
};
