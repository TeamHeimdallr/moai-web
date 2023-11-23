import { Chain, defineChain } from 'viem';

import { IS_MAINNET } from '~/constants';

export const theRootNetwork: Chain = defineChain(
  IS_MAINNET
    ? {
        id: 7668,
        name: 'The Root Network - Mainnet',
        network: 'The Root Network - Mainnet',
        nativeCurrency: {
          name: 'XRP',
          symbol: 'XRP',
          decimals: 6,
        },
        rpcUrls: {
          public: {
            http: ['https://root.rootnet.live/archive'],
            webSocket: ['wss://root.rootnet.live/archive/ws'],
          },
          default: {
            http: ['https://root.rootnet.live/archive'],
            webSocket: ['wss://root.rootnet.live/archive/ws'],
          },
        },
        blockExplorers: {
          default: {
            name: 'The Root Network',
            url: 'https://explorer.rootnet.live/',
          },
        },
        testnet: false,
      }
    : {
        id: 7672,
        name: 'The Root Network - Porcini',
        network: 'The Root Network - Porcini',
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
      }
);

export const xrpEvmSidechain: Chain = defineChain({
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
});
