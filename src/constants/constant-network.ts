import {
  imageNetworkEmpty,
  imageNetworkEvm,
  imageNetworkROOT,
  imageNetworkXRPL,
} from '~/assets/images';

import { IAmm, IGnbChainList, NETWORK } from '~/types';

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

export const EVM_CONTRACT_ADDRESS: Record<string, { VAULT: string; FUTUREPASS_REGISTER: string }> =
  {
    [NETWORK.THE_ROOT_NETWORK]: {
      VAULT: IS_MAINNET ? '' : '0x6548DEA2fB59143215E54595D0157B79aac1335e',
      FUTUREPASS_REGISTER: IS_MAINNET
        ? '0x000000000000000000000000000000000000FFff'
        : '0x000000000000000000000000000000000000FFff',
    },
    [NETWORK.EVM_SIDECHAIN]: {
      VAULT: IS_MAINNET ? '' : '0x1cc5a9f4fd07E97e616F72D829d38c0A6aC5D623',
      FUTUREPASS_REGISTER: IS_MAINNET ? '' : '',
    },
  };

export const EVM_TOKEN_ADDRESS: Record<string, Record<string, string>> = {
  [NETWORK.THE_ROOT_NETWORK]: {
    ZERO: IS_MAINNET ? '' : '0x0000000000000000000000000000000000000000',
    XRP: IS_MAINNET ? '' : '0xCCCCcCCc00000002000000000000000000000000',
    ROOT: IS_MAINNET ? '' : '0xcCcCCccC00000001000000000000000000000000',

    ROOT_XRP: IS_MAINNET ? '' : '0x291af6e1b841cad6e3dcd66f2aa0790a007578ad',

    // TODO Moai token address
    MOAI: IS_MAINNET ? '' : '',
  },
  [NETWORK.EVM_SIDECHAIN]: {
    ZERO: IS_MAINNET ? '' : '0x0000000000000000000000000000000000000000',
    XRP: IS_MAINNET ? '' : '0x80dDA4A58Ed8f7E8F992Bbf49efA54aAB618Ab26',
    WXRP: IS_MAINNET ? '' : '0x80dDA4A58Ed8f7E8F992Bbf49efA54aAB618Ab26',
    WETH: IS_MAINNET ? '' : '0x2A40A6D0Fb23cf12F550BaFfd54fb82b07a21BDe',

    WETH_XRP: IS_MAINNET ? '' : '0xe73749250390C51e029CfaB3d0488E08C183a671',

    // TODO Moai token address
    MOAI: IS_MAINNET ? '' : '',
  },
};

// TODO: connect to server
export const EVM_POOL: Record<string, Record<string, string>[]> = {
  [NETWORK.THE_ROOT_NETWORK]: [
    {
      id: IS_MAINNET ? '' : '0x291af6e1b841cad6e3dcd66f2aa0790a007578ad000200000000000000000000',
      tokenName: 'ROOT_XRP',
      tokenAddress: IS_MAINNET ? '' : '0x291af6e1b841cad6e3dcd66f2aa0790a007578ad',
    },
  ],
  [NETWORK.EVM_SIDECHAIN]: [
    {
      id: IS_MAINNET ? '' : '0xe73749250390c51e029cfab3d0488e08c183a671000200000000000000000001',
      tokenName: 'WETH_XRP',
      tokenAddress: IS_MAINNET ? '' : '0xe73749250390C51e029CfaB3d0488E08C183a671',
    },
  ],
};

export const XRP_AMM: IAmm[] = [
  {
    id: IS_MAINNET ? '' : IS_TESTNET ? '' : 'rHxWxmYU1AkWFmp3eq2afQ4qrPE7sVqHVr',

    lpTokenName: 'XRP_MOI',
    lpTokenCurrency: '03DECA00BD834D6F16685F645625D144108D4D57',

    assets: {
      asset1: {
        currency: 'XRP',
      },
      asset2: {
        currency: 'MOI',
        issuer: 'rKvd5hkFXvPcmLuF2yYFyN6RkgNcnYrjok',
      },
    },
  },
];

export const XRP_TOKEN_ISSUER = {
  MOI: IS_MAINNET ? '' : IS_TESTNET ? '' : 'rKvd5hkFXvPcmLuF2yYFyN6RkgNcnYrjok',
  XRP_MOI: IS_MAINNET ? '' : IS_TESTNET ? '' : 'rHxWxmYU1AkWFmp3eq2afQ4qrPE7sVqHVr',
};

// TODO: connect to server
export const TOKEN_PRICE = {
  MOAI: 10.23,
  XRP: 0.5,
  WXRP: 0.5,
};

// TODO: connect to server
// TODO: token 별로 다름
export const TOKEN_DECIMAL = {
  [NETWORK.THE_ROOT_NETWORK]: 6,
  [NETWORK.EVM_SIDECHAIN]: 18,
  [NETWORK.XRPL]: 6,
};

// TODO: connect to server
// TODO: token 별로 다름
export const TOKEN_DECIMAL_WITHDRAW = {
  [NETWORK.THE_ROOT_NETWORK]: 18,
  [NETWORK.EVM_SIDECHAIN]: 18,
  [NETWORK.XRPL]: 6,
};
