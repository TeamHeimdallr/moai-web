import { ASSET_URL } from '~/constants';

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
            address: '123',
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
            address: '234',
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
