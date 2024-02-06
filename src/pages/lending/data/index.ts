import { ASSET_URL } from '~/constants';

import { NETWORK } from '~/types';

export const titleMap = {
  [NETWORK.THE_ROOT_NETWORK]: 'The Root Network',
  [NETWORK.XRPL]: 'XRPL',
  [NETWORK.EVM_SIDECHAIN]: 'Evm Sidechain',
};

// call contract
export const mySuppliesData = {
  pages: [
    {
      mySupplies: [
        {
          id: 1,
          asset: {
            symbol: 'XRP',
            image: `${ASSET_URL}/tokens/token-xrp.png`,
            balance: 5201.102,
            address: '0xCCCCcCCc00000002000000000000000000000000',
          },
          apy: 5.49,
          collateral: true,
        },
        {
          id: 2,
          asset: {
            symbol: 'USDC',
            image: `${ASSET_URL}/tokens/token-usdc.png`,
            balance: 239005.102,
            address: '0xcCcCCCCc00000864000000000000000000000000',
          },
          apy: 0.00249,
          collateral: false,
        },
      ],
    },
  ],
};
// call contract
export const myBorrowsData = {
  pages: [
    {
      myBorrows: [
        {
          id: 1,
          asset: {
            symbol: 'XRP',
            address: '0xCCCCcCCc00000002000000000000000000000000',
            image: `${ASSET_URL}/tokens/token-xrp.png`,
            debt: 5201.102,
          },
          apy: [
            { apy: 5.49, apyType: 'variable' },
            { apy: 1.49, apyType: 'stable' },
          ],
          currentApy: { apy: 5.49, apyType: 'variable' },
        },
        {
          id: 2,
          asset: {
            symbol: 'USDC',
            address: '0xcCcCCCCc00000864000000000000000000000000',
            image: `${ASSET_URL}/tokens/token-usdc.png`,
            debt: 239005.102,
          },
          apy: [
            { apy: 0.00249, apyType: 'variable' },
            { apy: 0.00122, apyType: 'stable' },
          ],
          currentApy: { apy: 0.00122, apyType: 'stable' },
          collateral: false,
        },
      ],
    },
  ],
};
