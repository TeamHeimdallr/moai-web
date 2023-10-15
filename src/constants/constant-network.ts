import { imageNetworkEmpty, imageNetworkROOT, imageNetworkXRPL } from '~/assets/images';

import { IGnbChainList, NETWORK } from '~/types';

import { IS_MAINNET } from '.';

export const NETWORK_IMAGE_MAPPER: Record<string, string> = {
  [NETWORK.THE_ROOT_NETWORK]: imageNetworkROOT,
  [NETWORK.EVM_SIDECHAIN]: imageNetworkXRPL,
  [NETWORK.XRPL]: imageNetworkXRPL,
  EMPTY: imageNetworkEmpty,
};

export const NETWORK_SELECT: IGnbChainList[] = [
  { network: NETWORK.THE_ROOT_NETWORK, text: 'The Root Network' },
  { network: NETWORK.XRPL, text: 'XRPL' },
  { network: NETWORK.EVM_SIDECHAIN, text: 'EVM Sidechain' },
];

export const XRPL_JSON_RPC = IS_MAINNET ? '' : 'https://s.devnet.rippletest.net:51234/';
export const XRPL_WSS = IS_MAINNET ? '' : 'wss://s.devnet.rippletest.net:51233/';

export const SCANNER_URL = {
  [NETWORK.THE_ROOT_NETWORK]: IS_MAINNET ? '' : 'https://explorer.rootnet.cloud',
  [NETWORK.EVM_SIDECHAIN]: IS_MAINNET ? '' : 'https://evm-sidechain.xrpl.org',
  [NETWORK.XRPL]: IS_MAINNET ? '' : 'https://devnet.xrpl.org',
};
