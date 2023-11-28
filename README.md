# MOAI-FINANCE WEB

Official web for the Moai Finance - Your Universal Gateway to the Multi-chain Liquidity

![moai devnet](https://github.com/TeamHeimdallr/moai-web/actions/workflows/deploy-devnet.yml/badge.svg?branch=main)
![moai testnet](https://github.com/TeamHeimdallr/moai-web/actions/workflows/deploy-testnet.yml/badge.svg?branch=deploy-xrpl)
![moai mainnet](https://github.com/TeamHeimdallr/moai-web/actions/workflows/deploy-mainnet.yml/badge.svg?branch=deploy-root)

## Tech Stack

**Core frameworks and libraries**

- React 18
- Vite 4
- Yarn 3

**Wallets**

- [Web3Modal](https://web3modal.com/) for evm
- [Gem wallet](https://gemwallet.app/) for xrpl
  - To enhance the seamless user experience, ㅈe support a Gem wallet with a browser extension

**Blockchain-related libraries**

- [Viem](https://viem.sh/)
- [Wagmi](https://wagmi.sh/)
- [Balancer JS SDK](https://www.npmjs.com/package/@balancer-labs/balancer-js)

- [Gem Wallet API](https://gemwallet.app/docs/user-guide/introduction)
- [Crossmark Wallet API](https://docs.crossmark.io/)

- [XRPL SDK](https://xrpl.org/docs.html)

## Project Structure

### Branches

`dev`: The default branch used for project development.

`mainnet`: Branch that deploy services to the mainnet environment of chains supported by moai-web

`testnet`: Branch that deploy services to the testnet environment of chains supported by moai-web

`devnet`: Branch that deploy services to the devnet environment of chains supported by moai-web

### Directory structure

Below is the overall project source code structure

```
src
├── api                 // core APIs
├── assets              // images, icons, logos, etc
├── components          // components used universally across the service
├── configs             // settings for polyfills, web3 wallet, and network configuration
├── constants           // constants
├── hocs                // higher order components
├── hooks               // react custom hooks used universally across the service
├── pages               // moai-web pages
├── states              // zustand global states
├── styles              // base css and compiled tailwind css
├── types               // custom type interfaces
└── utils               // util functions
```

There are three types of chains supported by Moai Finance: The Root Network, XRP Ledger, and Evm
sidechain, and the same and seamless UI is provided for all chains. To make this possible, constant
values, components, and types are implemented as chain agonistic for the supporting chains.

To explain more about the folder structure,

The `/api` folder contains codes that communicate with contracts and the Moai server, and they are
all written in the form of custom hooks and managed in a reusable form. The `/components` folder
contains components used in the moai finance service. All components are implemented chain
agonistically. The `/configs` folder contains chain configuration objects for The Root Network and
EVM Sidechain. We connect to the rpc node through this object. In the `/hocs` folder, high order
components such as error boundary and react query provider are implemented, and a web3 provider that
enables communication with evm-based chains is also implemented. In the `/hooks` folder, the logic
used throughout moai finance service is implemented in custom hook format. The moai finance service
page is implemented in the `/pages` folder, and context-full components and custom hooks used in the
page are also implemented internally. Global state objects are implemented in the `/states` folder.

## API Structure

### XRP Ledger

Moai finance implements and uses a function that integrates evm-based communication and xrpl-based
communication to support chain agonistic contract communication supported by the service. Contract
communication functions for evm-based chains are implemented in the `/apis/_evm` folder. All
evm-based chains are managed using wagmi, viem, and ethersjs modules. The `/apis/_xrp` folder
contains contract communication functions for the xrp ledger chain, and communicates using the xrpl
sdk. We then implemented a custom hook that combines these to enable chain agonistic contract
communication. In the example below, you can see the custom hook for the add liquidity function, and
below that you can see the evm-based add liquidity function and the xrp-based add liquidity
function, respectively. In the add liquidity custom hook, function calls are branched according to
the pool chain currently being viewed or the selected chain environment, and the process of
parameter pre-processing and post-processing of response data to ensure the same response data has
been implemented.

```typescript
// add liquidity query hook
interface Props {
  id: string;
  tokens: {
    address?: string; // or issuer
    currency?: string;
    amount: string;
  }[];
  enabled?: boolean;
}

export const useAddLiquidity = ({ id, tokens, enabled }: Props) => {
  const { isEvm } = useNetwork();

  const resEvm = useAddLiquidityEvm({
    poolId: id,
    tokens: tokens?.map(t => t?.address ?? '') ?? [],
    amountsIn: tokens?.map(t => BigInt(t?.amount || '0')) ?? [],
    enabled,
  });
  const resXrp = useAddLiquidityXrp({
    id,
    token1: {
      issuer: tokens?.[0]?.address ?? '',
      amount: tokens?.[0]?.amount ?? '0',
      currency: tokens?.[0]?.currency ?? '',
    },
    token2: {
      issuer: tokens?.[1]?.address ?? '',
      amount: tokens?.[1]?.amount ?? '0',
      currency: tokens?.[1]?.currency ?? '',
    },
    enabled,
  });

  return isEvm ? resEvm : resXrp;
};


// add liquidity query hook for XRPL
export const useAddLiquidity = ({ id, token1, token2, enabled }: Props) => {
  ...

  const txAssets = getTxRequestAssets();
  const txRequest = {
    TransactionType: 'AMMDeposit',
    Account: address,
    ...txAssets,
    Fee: '100',
    Flags: 1048576, // tfTwoAsset
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const submitTx = async () => await submitTransaction({ transaction: txRequest as any });

  const { data, isLoading, isSuccess, mutateAsync } = useMutation<SubmitTransactionResponse>(
    QUERY_KEYS.AMM.ADD_LIQUIDITY,
    submitTx
  );

  ...
  const writeAsync = async () => {
    if (!ammExist || !address || !isXrp || !enabled) return;
    await mutateAsync?.();
  };

  ...
};

```

## How to Start

### Run local server

To run it in a local environment, execute the following command:

```bash
$ yarn install      // install deps
$ yarn local        // start local server (localhost:3000)
```

### Setup env

When running in a local environment, It need to set up environment variables in a .env file. After
creating a WalletConnect project on [WalletConnect Cloud](https://cloud.walletconnect.com/) and
obtaining the project ID, add the following line to your .env file:

```bash
VITE_WALLETCONNECT_PROJECT_ID={project ID}
```

### Wallet prerequisites

To use wallet connection and transactions, you'll need to install both the MetaMask extension and
the Gem wallet extension.

- [MetaMask](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn)
  (evm)
- [Gem Wallet](https://chrome.google.com/webstore/detail/gemwallet/egebedonbdapoieedfcfkofloclfghab)
  or
  [Crossmark Wallet](https://chrome.google.com/webstore/detail/crossmark/canipghmckojpianfgiklhbgpfmhjkjg)
  (xrp)

## Roadmap

- [x] Support XRP Ledger
- [x] Support The Root Network
- [x] Landing page
- [x] Integrate all support chains
- [ ] SDK for ui design system, contract interface and moai-backend
- [ ] Responsive UI for mobile web browser, Skeleton UI for API loading
- [ ] Support i18n and multi currency pricing for each token

## Screenshots

- integrated pools within XRP ecosystem

  <img src='https://assets.moai-finance.xyz/images/image-readme-screenshot-1.png' width='800' />

- xrp ledger AMM pool detail

  <img src='https://assets.moai-finance.xyz/images/image-readme-screenshot-2.png' width='800' />

- add liquidity example

  <img src='https://assets.moai-finance.xyz/images/image-readme-screenshot-3.png' width='800' />

## Authors

- [Team Heimdallr](https://github.com/TeamHeimdallr)

## Contributing

![Alt](https://repobeats.axiom.co/api/embed/bebdba43ba8bec653f3a50cddeba99cd1be1491d.svg 'Repobeats analytics image')
