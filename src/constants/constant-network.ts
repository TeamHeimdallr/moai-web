import {
  imageNetworkEmpty,
  imageNetworkEvm,
  imageNetworkROOT,
  imageNetworkXRPL,
} from '~/assets/images';

import { IGnbChainList, NETWORK } from '~/types';

import { IS_MAINNET, IS_TESTNET } from '.';

export const NETWORK_IMAGE_MAPPER: Record<string, string> = {
  [NETWORK.THE_ROOT_NETWORK]: imageNetworkROOT,
  [NETWORK.EVM_SIDECHAIN]: imageNetworkEvm,
  [NETWORK.XRPL]: imageNetworkXRPL,
  EMPTY: imageNetworkEmpty,
};

export const NETWORK_SELECT: IGnbChainList[] = [
  { network: NETWORK.THE_ROOT_NETWORK, text: 'The Root Network' },
  { network: NETWORK.XRPL, text: 'XRPL' },
  { network: NETWORK.EVM_SIDECHAIN, text: 'EVM Sidechain' },
];

export const XRPL_JSON_RPC = IS_MAINNET
  ? 'https://s1.ripple.com:51234'
  : IS_TESTNET
  ? 'https://s.altnet.rippletest.net:51234'
  : 'https://s.devnet.rippletest.net:51234';

export const XRPL_WSS = IS_MAINNET
  ? 'wss://s1.ripple.com'
  : IS_TESTNET
  ? 'wss://s.altnet.rippletest.net:51233'
  : 'wss://s.devnet.rippletest.net:51233';

export const SCANNER_URL = {
  [NETWORK.THE_ROOT_NETWORK]: IS_MAINNET
    ? 'https://explorer.rootnet.live'
    : 'https://explorer.rootnet.cloud',
  [NETWORK.EVM_SIDECHAIN]: IS_MAINNET
    ? 'https://evm-sidechain.xrpl.org'
    : 'https://evm-sidechain.xrpl.org',
  [NETWORK.XRPL]: IS_MAINNET
    ? 'https://livenet.xrpl.org'
    : IS_TESTNET
    ? 'https://testnet.xrpl.org'
    : 'https://devnet.xrpl.org',
};

export const EVM_TOKEN_ADDRESS: Record<string, Record<string, string>> = {
  [NETWORK.THE_ROOT_NETWORK]: {
    ZERO: IS_MAINNET ? '' : '0x0000000000000000000000000000000000000000',
    XRP: IS_MAINNET ? '' : '0xCCCCcCCc00000002000000000000000000000000',
  },
  [NETWORK.EVM_SIDECHAIN]: {
    ZERO: IS_MAINNET ? '' : '0x0000000000000000000000000000000000000000',
    WXRP: IS_MAINNET
      ? '0x80dDA4A58Ed8f7E8F992Bbf49efA54aAB618Ab26'
      : '0x80dDA4A58Ed8f7E8F992Bbf49efA54aAB618Ab26',
    XRP: IS_MAINNET ? '' : '0x0000000000000000000000000000000000000000',
  },
};

export const TOKEN_DECIMAL = {
  [NETWORK.THE_ROOT_NETWORK]: 6,
  [NETWORK.EVM_SIDECHAIN]: 18,
  [NETWORK.XRPL]: 6,
};

export const TOKEN_DECIMAL_WITHDRAW_LP = {
  [NETWORK.THE_ROOT_NETWORK]: 18,
  [NETWORK.EVM_SIDECHAIN]: 18,
  [NETWORK.XRPL]: 6,
};
