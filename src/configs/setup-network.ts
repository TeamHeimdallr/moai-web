import { Chain } from 'viem';

export const theRootNetwork: Chain = {
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
