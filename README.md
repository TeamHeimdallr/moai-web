# MOAI-FINANCE WEB

Official web for the Moai Finance - Your Universal Gateway to Multi-chain Liquidity

![moai status](https://github.com/TeamHeimdallr/moai-web/actions/workflows/deploy.yml/badge.svg?branch=main)
![moai root status](https://github.com/TeamHeimdallr/moai-web/actions/workflows/deploy-root.yml/badge.svg?branch=deploy-root)
![moai xrpl status](https://github.com/TeamHeimdallr/moai-web/actions/workflows/deploy-xrpl.yml/badge.svg?branch=deploy-xrpl)
![moai xrp evm status](https://github.com/TeamHeimdallr/moai-web/actions/workflows/deploy-xrpevm.yml/badge.svg?branch=deploy-xrpevm)

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

## Project Structure

### Branches

`dev`: The default branch used for project development.

`main`: The branch used for deploying the Moai-web service.

`deploy-root`: The branch used for deploying the root network service of Moai-web.

`deploy-xrpl`: The branch used for deploying the XRP Ledger service of Moai-web.

### Directory structure

Below is the overall project source code structure

```
src
├── assets              // images, icons, logos, etc
├── components          // components used universally across the service
├── configs             // settings for polyfills, web3 wallet, and network configuration
├── constants           // constants
├── hocs                // higher order components
├── hooks               // react custom hooks used universally across the service
├── moai-xrp-ledger     // codes for the moai-web on XRP-ledger
│   ├── api             // core APIs for XRPL
│   ├── components
│   ├── constants
│   ├── data
│   ├── hooks
│   ├── pages
│   └── types
├── moai-xrp-root       // codes for the moai-web on The Root Network
│   ├── abi
│   ├── api             // core APIs for TRN
│   ├── components
│   ├── constants
│   ├── data
│   ├── hooks
│   ├── pages
│   └── types
├── pages               // moai-web pages
├── states              // zustand global states
├── styles              // base css and compiled tailwind css
├── types               // custom type interfaces
└── utils               // util functions
```

Codes that are used across all three networks, namely The Root Network, XRP Ledger, and EVM
Sidechain, are located directly under src folder.

Code that operates within the specific context of each network is contained in its respective
network folder, such as `src/moai-xrp-ledger` and `src/moai-xrp-root`.

The `src/pages` directory, which is located directly under the `src` folder, is where the main page
of the Moai-web service is implemented. This page is responsible for integrating and displaying
pools deployed on various networks within the XRP ecosystem.

The `api/` folder contains core code for communicating with each network, implemented in the form of
custom hooks using React hooks and Wagmi. These hooks facilitate communication with the respective
networks. Additionally, in the `hooks/` directory, the API responses are processed and customized to
suit the needs of the user interface.

## API Structure

### XRP Ledger

Moai-web XRP Ledger uses the [xrpl.js](https://github.com/XRPLF/xrpl.js/blob/main/README.md) library
to communicate with the AMM Devnet network through a WebSocket client. If the user needs to sign
transactions, it is processed using the Gem Wallet API. Both of these interactions are encapsulated
within React Query to manage rate limiting, errors, and loading status.

Here are example codes for fetching AMM information with an `amm_info` request and adding liquidity
to a pool with an `AMMDeposit` transaction:

```typescript
// amm_info request
const { client, isConnected } = useXrplStore();
const amm = AMM[account];

const request = {
  command: 'amm_info',
  asset: amm?.asset1,
  asset2: amm?.asset2,
  ledger_index: 'validated',
} as BaseRequest;

const getAmm = async () => {
  const info = await client.request<BaseRequest, AmmResponse>(request);
  return info;
};

...

const { data: ammInfoRawData } = useQuery(
  [...QUERY_KEYS.AMM.GET_AMM_INFO, amm?.asset1.currency, amm?.asset2.currency],
  getAmm,
  { staleTime: 1000 * 60 * 5, enabled: isConnected && !!amm }
);

...
```

```typescript
// AMMDeposit transactions
const { address, isInstalled } = useConnectXrplWallet();

...

const txAssets = getTxRequestAssets();
const txRequest = {
  TransactionType: 'AMMDeposit',
  Account: address,
  Fee: '100',
  Flags: 1048576, // tfTwoAsset
  ...txAssets,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const submitTx = async () => await submitTransaction({ transaction: txRequest as any });
const { data, isLoading, isSuccess, mutateAsync } = useMutation(
  QUERY_KEYS.AMM.ADD_LIQUIDITY,
  submitTx
);
```

### The Root Network

Since The Root Network is EVM-based, it uses Viem and Wagmi for network communication. These tools
are essential for handling network interactions and transactions within The Root Network, leveraging
the Ethereum Virtual Machine (EVM) compatibility.

Below is the add liquidity transaction example code:

```typescript
// to minimize delays when a user triggers a transaction (e.g., by clicking a button), use a "prepare hook" to handle transaction-related logic like validation and initialization in advance.
const { isLoading: prepareLoading, config } = usePrepareContractWrite({
  address: CONTRACT_ADDRESS.VAULT,
  abi: VAULT_ABI,
  functionName: 'joinPool',
  chainId: CHAIN_ID,

  account: walletAddress,
  args: [
    poolId,
    walletAddress,
    walletAddress,
    [
      sortedTokens,
      sortedAmountsIn,
      WeightedPoolEncoder.joinExactTokensInForBPTOut(sortedAmountsIn, '0'),
      false,
    ],
  ],
  enabled: enabled && isConnected,
});

const { data, writeAsync } = useContractWrite(config);
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
  (xrp)

## Roadmap

- [x] Support XRP Ledger
- [x] Support The Root Network
- [ ] SDK for ui design system, contract interface and moai-backend
- [ ] Responsive UI for mobile web browser, Skeleton UI for API loading
- [ ] Support i18n and multi currency pricing for each token

## Screenshots

- integrated pools within XRP ecosystem

  <img src='https://moai-finance-assets.s3.amazonaws.com/images/image-readme-screenshot-1.png' width='800' />

- xrp ledger AMM pool detail

  <img src='https://moai-finance-assets.s3.amazonaws.com/images/image-readme-screenshot-2.png' width='800' />

- add liquidity example

  <img src='https://moai-finance-assets.s3.amazonaws.com/images/image-readme-screenshot-3.png' width='800' />

## Authors

- [Team Heimdallr](https://github.com/TeamHeimdallr)

## Contributing

![Alt](https://repobeats.axiom.co/api/embed/bebdba43ba8bec653f3a50cddeba99cd1be1491d.svg 'Repobeats analytics image')
