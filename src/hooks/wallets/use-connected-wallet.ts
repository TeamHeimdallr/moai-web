import crossmarkSdk from '@crossmarkio/sdk';
import {
  submitTransaction as gemSubmitTransaction,
  SubmitTransactionResponse,
} from '@gemwallet/api';
import { zeroAddress } from 'viem';
import { Transaction } from 'xrpl';

import { BLOCKCHAIN_ENV } from '~/constants';

import { truncateAddress } from '~/utils/util-string';
import { useTheRootNetworkSwitchWalletStore } from '~/states/contexts/wallets/switch-wallet';
import { useXummWalletStore } from '~/states/contexts/wallets/xumm-wallet';
import { NETWORK } from '~/types';

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
        submitTransaction: async (tx: any) => {
          if (!xummWalletClient) return;
          const payload = xummWalletClient.payload.createAndSubscribe({
            txjson: tx,
            options: {
              force_network: BLOCKCHAIN_ENV,
            },
          });
          const res = await payload;

          window.open(
            res.created.next.always,
            '_blank',
            'width=700, height=600, top=50, left=50, scrollbars=yes'
          );
          return res;
        },
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

/*
{
  "created": {
    "uuid": "c486f219-aac4-44ca-a92a-306d7a0487b8",
    "next": {
      "always": "https://xumm.app/sign/c486f219-aac4-44ca-a92a-306d7a0487b8",
      "no_push_msg_received": "https://xumm.app/sign/c486f219-aac4-44ca-a92a-306d7a0487b8/qr"
    },
    "refs": {
      "qr_png": "https://xumm.app/sign/c486f219-aac4-44ca-a92a-306d7a0487b8_q.png",
      "qr_matrix": "https://xumm.app/sign/c486f219-aac4-44ca-a92a-306d7a0487b8_q.json",
      "qr_uri_quality_opts": [
        "m",
        "q",
        "h"
      ],
      "websocket_status": "wss://xumm.app/sign/c486f219-aac4-44ca-a92a-306d7a0487b8"
    },
    "pushed": true
  },
  "payload": {
    "meta": {
      "exists": true,
      "uuid": "c486f219-aac4-44ca-a92a-306d7a0487b8",
      "multisign": false,
      "submit": true,
      "pathfinding": false,
      "pathfinding_fallback": false,
      "force_network": null,
      "destination": "",
      "resolved_destination": "",
      "resolved": false,
      "signed": false,
      "cancelled": false,
      "expired": false,
      "pushed": true,
      "app_opened": false,
      "opened_by_deeplink": null,
      "return_url_app": null,
      "return_url_web": null,
      "is_xapp": false,
      "signers": null
    },
    "application": {
      "name": "MOAI-FINANCE",
      "description": "Universal Gateway to the Multi-chain Liquidity",
      "disabled": 0,
      "uuidv4": "53450be0-f836-49e3-868e-faa52c64b4ed",
      "icon_url": "https://cdn.xumm.pro/cdn-cgi/image/width=500,height=500,quality=75,fit=crop/app-logo/5bb8dd56-5634-4980-9539-ab50dd420a39.png",
      "issued_user_token": null
    },
    "payload": {
      "tx_type": "TrustSet",
      "tx_destination": "",
      "tx_destination_tag": null,
      "request_json": {
        "TransactionType": "TrustSet",
        "Account": "rhkVK9KdJd5y8asYEA1jKvz2jH2Q2pJECh",
        "Fee": "100",
        "Flags": 262144,
        "LimitAmount": {
          "currency": "MOI",
          "issuer": "rKvd5hkFXvPcmLuF2yYFyN6RkgNcnYrjok",
          "value": "10000000000.000000"
        }
      },
      "origintype": null,
      "signmethod": null,
      "created_at": "2023-12-15T08:15:18Z",
      "expires_at": "2023-12-16T08:15:18Z",
      "expires_in_seconds": 86399
    },
    "response": {
      "hex": null,
      "txid": null,
      "resolved_at": null,
      "dispatched_to": null,
      "dispatched_nodetype": null,
      "dispatched_result": null,
      "dispatched_to_node": false,
      "environment_nodeuri": null,
      "environment_nodetype": null,
      "multisign_account": null,
      "account": "rhkVK9KdJd5y8asYEA1jKvz2jH2Q2pJECh",
      "signer": null,
      "user": null
    },
    "custom_meta": {
      "identifier": null,
      "blob": null,
      "instruction": null
    }
  },
  "resolved": {},
  "websocket": {}
}
*/
