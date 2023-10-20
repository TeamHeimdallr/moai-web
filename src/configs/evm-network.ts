import { Chain } from 'viem';

export const theRootNetworkTestnet: Chain = {
  id: 7672,
  name: 'The Root Network - Porcini',
  network: 'porcini',
  nativeCurrency: {
    name: 'XRP',
    symbol: 'XRP',
    decimals: 6,
  },
  rpcUrls: {
    public: {
      http: ['https://porcini.rootnet.app/archive'],
      webSocket: ['wss://porcini.rootnet.app/archive/ws'],
    },
    default: {
      http: ['https://porcini.rootnet.app/archive'],
      webSocket: ['wss://porcini.rootnet.app/archive/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'The Root Network',
      url: 'https://explorer.rootnet.cloud/',
    },
  },
  testnet: true,
};

export const xrpEvmSidechainTestnet: Chain = {
  id: 1440002,
  name: 'XRP EVM Sidechain - Devnet',
  network: 'xrpevm',
  nativeCurrency: {
    name: 'XRP',
    symbol: 'XRP',
    decimals: 18,
  },
  rpcUrls: {
    public: {
      http: ['https://rpc-evm-sidechain.xrpl.org'],
    },
    default: {
      http: ['https://rpc-evm-sidechain.xrpl.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'XRP EVM Sidechain',
      url: 'https://evm-sidechain.xrpl.org/',
    },
  },
  testnet: true,
};