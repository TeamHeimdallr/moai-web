import {
  imageNetworkEmpty,
  imageNetworkEthereum,
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
  ETHEREUM: imageNetworkEthereum,
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
  [NETWORK.THE_ROOT_NETWORK]: IS_MAINNET ? 'https://rootscan.io' : 'https://porcini.rootscan.io',
  [NETWORK.EVM_SIDECHAIN]: IS_MAINNET
    ? 'https://evm-sidechain.xrpl.org'
    : 'https://evm-sidechain.xrpl.org',
  [NETWORK.XRPL]: IS_MAINNET
    ? 'https://livenet.xrpl.org'
    : IS_TESTNET
    ? 'https://testnet.xrpl.org'
    : 'https://devnet.xrpl.org',
  ETHEREUM: IS_MAINNET ? 'https://etherscan.io' : 'https://sepolia.etherscan.io',
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

export const CAMPAIGN_REWARD_ADDRESS: Record<string, string> = {
  [NETWORK.THE_ROOT_NETWORK]: IS_MAINNET
    ? '0xB61b7Af7e9a188BD162f5cE1aFD939dde05e2826'
    : '0x6ca22266d295AB1019C38d200F4912806C8b22a8',
};

export const UNITROLLER_ADDRESS: Record<string, string> = {
  [NETWORK.THE_ROOT_NETWORK]: IS_MAINNET
    ? '0xCB8e9eDb7DEc4e01eac5F8e669b089ff02EEcf59'
    : '0xCB8e9eDb7DEc4e01eac5F8e669b089ff02EEcf59',
};

export const MOAILENS_ADDRESS: Record<string, string> = {
  [NETWORK.THE_ROOT_NETWORK]: IS_MAINNET
    ? '0x761653d923CEBea498A1DD150e5b79fE6af9183d'
    : '0xAF6396c1B6603A7f31FC524E9E42c8137aB869eC',
};

export const LENDING_ORACLE_ADDRESS: Record<string, string> = {
  [NETWORK.THE_ROOT_NETWORK]: IS_MAINNET
    ? '0xB2d3A7CA7B752c9d8d19AA48E87a1A9f506C1097'
    : '0x13b1e9279A472F88f2e510E429A838003bb3B9F2',
};

export const POOL_ID = {
  [NETWORK.THE_ROOT_NETWORK]: {
    ROOT_XRP: IS_MAINNET
      ? '0xb56db41c597f0ffa615863da93612aa590171842000200000000000000000000'
      : '0xad77a729f590aa35e7631a5d11b422d3198b6cb0000200000000000000000000',
  },
};

export const LP_FARM_ADDRESS_WITH_POOL_ID = {
  [NETWORK.THE_ROOT_NETWORK]: IS_MAINNET
    ? {
        '0xb56db41c597f0ffa615863da93612aa590171842000200000000000000000000': '0x0', // XRP-ROOT
        '0xf3c7834ef75dd6330d8cd0b22435416382573fc0000200000000000000000001': '0x0', // XRP-USDC
        '0x061624e3629547c6f9691f5118d715a015f43b85000200000000000000000002': '0x0', // XRP-ASTO
        '0x4ba71e25c34af053a07fae82103c2f52a5ece1a3000200000000000000000003': '0x0', // XRP-SYLO
        '0xb0c5d8c3414e4a2c320dbbb2e1a1e15582fcfcc1000200000000000000000004':
          '0xd981287158AA9B2F7bD5B30B26fE1267FB1FfA15', // ROOT-ETH
        '0xb4157e701d5a9469f352faf9cfb971259299ed4d000200000000000000000005':
          '0x2C6050D4c0aA21F012330744872061f250dE5FFe', // ROOT-USDC
        '0x1e5fb7be66111b18c41e4c3f3232166afe95daae000000000000000000000006':
          '0x7Ce08a9aA144c18e7aC6359067Fc540BDC129b9F', // USDC-USDT
      }
    : {
        '0xad77a729f590aa35e7631a5d11b422d3198b6cb0000200000000000000000000': '0x0', // XRP-ROOT
        '0xa0e83a466468b0b6de5e685f91e0bdba3835d2a7000200000000000000000001': '0x0', // XRP-USDC
        '0xc6b5662ec4bb15cc630e0a6332ea529e0206a496000200000000000000000002': '0x0', // XRP-ASTO
        '0xc30b9fc093fc1a0153b01a9a42e1a86c2461a378000200000000000000000003': '0x0', // XRP-SYLO
        '0x8da5867ff5d8b5363ab66eb9fbf834f3b77c7362000200000000000000000004':
          '0x685C976ff86F143B0bA03b6c52A8802B4b2c7d5C', // ROOT-ETH
        '0x96df797160490e480519b7addb113cdc8ad58f14000200000000000000000005':
          '0x67b81bc695547739C3b6Ed56d58a2C699016e4fD', // ROOT-USDC
        '0xb7494cec27dc2a4a94f1808bc7af266958739d66000000000000000000000006':
          '0x04E6c8eAF426CD4369BA55603509AC299805fb64', // USDC-USDT
      },
};

export const STABLE_POOL_IDS = {
  [NETWORK.THE_ROOT_NETWORK]: IS_MAINNET
    ? ['0x1e5fb7be66111b18c41e4c3f3232166afe95daae000000000000000000000006']
    : ['0xb7494cec27dc2a4a94f1808bc7af266958739d66000000000000000000000006'],
};

export const STABLE_POOL_ADDRESS = {
  [NETWORK.THE_ROOT_NETWORK]: IS_MAINNET
    ? ['0x1E5FB7be66111B18C41E4C3F3232166afE95DAAE']
    : ['0xb7494CEC27Dc2A4a94F1808Bc7AF266958739D66'],
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

export const ROOT_ASSET_ID = {
  XRP: IS_MAINNET ? 2 : 2,
  ROOT: IS_MAINNET ? 1 : 1,
  ASTO: IS_MAINNET ? 4196 : 17508,
  SYLO: IS_MAINNET ? 2148 : 3172,
  USDC: IS_MAINNET ? 3172 : 2148,
};
