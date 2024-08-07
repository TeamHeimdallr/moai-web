import { addresses } from 'rootnameservice';
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
            // http: ['https://mainnet.rpc-moai-finance.xyz/archive'],
            // webSocket: ['wss://mainnet.rpc-moai-finance.xyz/ws'],
            http: ['https://root.rootnet.live/archive'],
            webSocket: ['wss://root.rootnet.live/archive/ws'],
          },
          default: {
            // http: ['https://mainnet.rpc-moai-finance.xyz/archive'],
            // webSocket: ['wss://mainnet.rpc-moai-finance.xyz/ws'],
            http: ['https://root.rootnet.live/archive'],
            webSocket: ['wss://root.rootnet.live/archive/ws'],
          },
        },
        contracts: {
          ...addresses[7668],
        },
        subgraphs: {
          ens: {
            url: 'https://subgraph.rootnameservice.com/subgraphs/name/graphprotocol/ens/graphql',
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
            // http: ['https://porcini.rpc-moai-finance.xyz/archive'],
            // webSocket: ['wss://porcini.rpc-moai-finance.xyz/ws'],
            http: ['https://porcini.rootnet.app/archive'],
            webSocket: ['wss://porcini.rootnet.app/archive/ws'],
          },
          default: {
            // http: ['https://porcini.rpc-moai-finance.xyz/archive'],
            // webSocket: ['wss://porcini.rpc-moai-finance.xyz/ws'],
            http: ['https://porcini.rootnet.app/archive'],
            webSocket: ['wss://porcini.rootnet.app/archive/ws'],
          },
        },
        contracts: {
          ...addresses[7672],
        },
        subgraphs: {
          ens: {
            url: 'https://subgraph-stage.rootnameservice.com/subgraphs/name/graphprotocol/ens/graphql',
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

export const theRootNetworkForAdd = IS_MAINNET
  ? {
      chainId: '0x1df4',
      chainName: 'The Root Network - Mainnet',
      rpcUrls: ['https://root.rootnet.live/archive'],
      nativeCurrency: {
        name: 'XRP',
        symbol: 'XRP',
        decimals: 18,
      },
      blockExplorerUrls: ['https://explorer.rootnet.live/'],
    }
  : {
      chainId: '0x1df8',
      chainName: 'The Root Network - Porcini Testnet',
      nativeCurrency: {
        name: 'XRP',
        symbol: 'XRP',
        decimals: 18,
      },
      rpcUrls: ['https://porcini.rootnet.app/archive'],
      blockExplorerUrls: ['https://explorer.rootnet.cloud/'],
    };

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

export const xrpEvmSidechainForAdd = {
  chainId: '0x15f902',
  chainName: 'XRP EVM Sidechain - Devnet',
  nativeCurrency: {
    name: 'XRP',
    symbol: 'XRP',
    decimals: 18,
  },
  rpcUrls: ['https://rpc-evm-sidechain.xrpl.org'],
  blockExplorerUrls: ['https://evm-sidechain.xrpl.org/'],
};

export const ethereumForAdd = IS_MAINNET
  ? {
      chainId: '0x01',
      chainName: 'Ethereum Mainnet',
      rpcUrls: ['https://mainnet.infura.io/v3/'],
      nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18,
      },
      blockExplorerUrls: ['https://etherscan.io'],
    }
  : {
      chainId: '0xAA36A7',
      chainName: 'Sepolia test network',
      nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: ['https://sepolia.infura.io/v3/'],
      blockExplorerUrls: ['https://sepolia.etherscan.io'],
    };
