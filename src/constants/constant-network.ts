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
    WXRP: IS_MAINNET ? '' : '0x80dDA4A58Ed8f7E8F992Bbf49efA54aAB618Ab26',
    XRP: IS_MAINNET ? '' : '0x0000000000000000000000000000000000000000',
  },
};

export const EVM_VAULT_ADDRESS: Record<string, string> = {
  [NETWORK.THE_ROOT_NETWORK]: IS_MAINNET
    ? '0x1D6B655289328a1083EcD70170692002dBED1aBD'
    : '0xc922770de79fc31Cce42DF3fa8234c864fA3FeaE',
  [NETWORK.EVM_SIDECHAIN]: IS_MAINNET
    ? '0x1cc5a9f4fd07E97e616F72D829d38c0A6aC5D623'
    : '0x1cc5a9f4fd07E97e616F72D829d38c0A6aC5D623',
};

export const CAMPAIGN_ADDRESS: Record<string, string> = {
  [NETWORK.THE_ROOT_NETWORK]: IS_MAINNET
    ? '0xA9e9c94A7D54694FDB44739aD93D493e17a16d17'
    : '0x20E0fa7A8a1C22De73601cd6731Bb59c13B04916',
};

export const POOL_ID = {
  [NETWORK.THE_ROOT_NETWORK]: {
    ROOT_XRP: IS_MAINNET
      ? '0xb56db41c597f0ffa615863da93612aa590171842000200000000000000000000'
      : '0xad77a729f590aa35e7631a5d11b422d3198b6cb0000200000000000000000000',
  },
};

export const FAUCET_AMOUNT = {
  [NETWORK.XRPL]: {
    MOAI: 100,
    USDT: 5000,
    USDC: 5000,
    BTC: 2,
    ETH: 4,
  },
  [NETWORK.EVM_SIDECHAIN]: {
    MOAI: 100,
    USDC: 100,
    BTC: 1,
    ETH: 100,
    XRP: 10,
  },
};
