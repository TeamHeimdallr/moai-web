import crossmarkSdk from '@crossmarkio/sdk';
import {
  submitTransaction as gemSubmitTransaction,
  SubmitTransactionResponse,
} from '@gemwallet/api';
import dcent from 'dcent-web-connector';
import { encode } from 'ripple-binary-codec';
import { zeroAddress } from 'viem';
import { usePublicClient } from 'wagmi';
import { Transaction } from 'xrpl';

import { useGetRns } from '~/api/api-contract/_evm/rns/get-rns';

import { BLOCKCHAIN_ENV, IS_DEVNET } from '~/constants';

import { truncateAddress } from '~/utils/util-string';
import { useXummQrStore } from '~/states/components/xumm-qr';
import { useTheRootNetworkSwitchWalletStore } from '~/states/contexts/wallets/switch-wallet';
import { useXummWalletStore } from '~/states/contexts/wallets/xumm-wallet';
import { NETWORK, POPUP_ID } from '~/types';

import { usePopup } from '../components';
import { useXrpl } from '../contexts';
import { useNetwork } from '../contexts/use-network';

import { useFuturepassOf } from './use-futurepass-of';
import {
  useConnectWithCrossmarkWallet,
  useConnectWithDcentWallet,
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

  rns: string;
  fpassRns: string;

  anyAddress: string | undefined;
  currentAddress: string | undefined;
}
export const useConnectedWallet = (_network?: NETWORK): UseConnectedWallet => {
  const publicClient = usePublicClient();

  const { selectedWallet: selectedWalletTRN } = useTheRootNetworkSwitchWalletStore();
  const { selectedNetwork } = useNetwork();
  const network = _network || selectedNetwork;

  const { evm, fpass } = useConnectedEvmWallet();
  const xrp = useConnectedXrplWallet();

  const anyAddress = xrp?.address || fpass?.address || evm?.address;
  const currentAddress =
    network === NETWORK.THE_ROOT_NETWORK
      ? selectedWalletTRN === 'fpass'
        ? fpass?.address
        : evm?.address
      : network === NETWORK.EVM_SIDECHAIN
      ? evm?.address
      : network === NETWORK.XRPL
      ? xrp?.address
      : undefined;

  const { data: rnsData } = useGetRns(
    {
      network,
      publicClient,
      evmAddress: evm?.address,
      fpassAddress: fpass?.address,
    },
    {
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 5,
    }
  );
  const rns = rnsData?.rns || '';
  const fpassRns = rnsData?.fpassRns || '';

  return {
    evm,
    xrp,
    fpass,

    rns,
    fpassRns,

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

  const { open, close } = usePopup(POPUP_ID.XUMM_QR);
  const { setQr } = useXummQrStore();

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

  const {
    isConnected: isXrpDcentConnected,
    connect: connectXrpDcent,
    disconnect: disconnectXrpDcent,
    address: xrpDcentAddress,
    truncatedAddress: truncatedXrpDcentAddress,
    keyPath: xrpDcentKeyPath,
  } = useConnectWithDcentWallet();

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

            const options: Record<string, string> = {
              force_network: BLOCKCHAIN_ENV,
            };

            if (tx.TransactionType === 'Payment' && !!tx.Memos?.[0]?.Memo) {
              options.force_network = IS_DEVNET ? 'testnet' : BLOCKCHAIN_ENV;
            }
            xummWalletClient.payload
              .createAndSubscribe({ txjson: tx, options }, e => {
                if (typeof e.data.signed === 'undefined') return;

                if (e.data.signed === false) {
                  close();
                  reject();
                }

                xrplClient
                  .request({
                    command: 'tx',
                    transaction: e.data.txid,
                    binary: false,
                  })
                  .then(res => {
                    close();
                    resolve(res?.result || e.data);
                  })
                  .catch(() => {
                    close();
                    reject(e.data);
                  });
              })
              .then(res => {
                setQr(res.created.refs.qr_png);
                open();
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
        submitTransaction: async (tx: any) => {
          const res = await crossmarkSdk.async.signAndSubmitAndWait(tx);
          return res?.response?.data?.resp?.result;
        },
      }
    : isXrpGemConnected
    ? {
        isConnected: isXrpGemConnected,
        connect: connectXrpGem,
        disconnect: disconnectXrpGem,
        address: xrpGemAddress,
        truncatedAddress: truncatedXrpGemAddress,
        connectedConnector: 'gem',
        submitTransaction: async (tx: Transaction) => {
          const res = (await gemSubmitTransaction({
            transaction: tx,
          })) as SubmitTransactionResponse;
          const hash = res?.result?.hash;

          // TODO: error handling
          if (!hash) return res?.result;

          const txResult = await xrplClient.request({
            command: 'tx',
            transaction: hash,
          });

          return txResult?.result;
        },
      }
    : isXrpDcentConnected
    ? {
        isConnected: isXrpDcentConnected,
        connect: connectXrpDcent,
        disconnect: disconnectXrpDcent,
        address: xrpDcentAddress,
        truncatedAddress: truncatedXrpDcentAddress,
        connectedConnector: 'dcent',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        submitTransaction: async (tx: any) => {
          if (!xrpDcentKeyPath) return;
          const res = await dcent.getXrpSignedTransaction(tx, xrpDcentKeyPath);
          const { pubkey, sign } = res?.body?.parameter || {};

          const signer = {
            ...tx,
            SigningPubKey: pubkey,
            TxnSignature: sign,
          };
          const encoded = encode(signer);

          const submitted = await xrplClient.request({
            command: 'submit',
            tx_blob: encoded,
          });

          const final = submitted?.result?.tx_json;
          return final;
        },
      }
    : {
        isConnected: false,
        connect: () => {},
        disconnect: () => {},
        address: '',
        truncatedAddress: '',
        connectedConnector: '',
        submitTransaction: async (_tx: Transaction) => {},
      };
  return xrp;
};
