import { set, sub } from 'date-fns';

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

type ChartData = {
  date: string;
  value: number;
};
export const supplyAPRData = (range: string) => {
  const now = new Date();
  const midnight = set(new Date(now), { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });

  const res: ChartData[] = [];

  let lastValue = 2;
  for (let i = 0; i < 48; i++) {
    const date =
      range === '24h'
        ? sub(midnight, { minutes: i * 30 })
        : range === '7d'
        ? sub(midnight, { hours: i * 4 })
        : range === '14d'
        ? sub(midnight, { hours: i * 8 })
        : sub(midnight, { days: i });

    if (i >= 0 && i <= 12) {
      const value = lastValue - Math.random() / 5;
      res.push({
        date: date.toISOString(),
        value,
      });
      lastValue = value;
    }
    if (i > 12 && i <= 24) {
      const value = lastValue + Math.random() / 5;
      res.push({
        date: date.toISOString(),
        value,
      });
      lastValue = value;
    }
    if (i > 24 && i <= 36) {
      const value = lastValue - Math.random() / 5;
      res.push({
        date: date.toISOString(),
        value,
      });
      lastValue = value;
    }
    if (i > 36 && i < 48) {
      const value = lastValue + Math.random() / 5;
      res.push({
        date: date.toISOString(),
        value,
      });
      lastValue = value;
    }
  }

  return res.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const supplyAprDataStatic = [
  {
    date: '2023-12-27T15:00:00.000Z',
    value: 2.059749364665193,
  },
  {
    date: '2023-12-28T15:00:00.000Z',
    value: 1.8721374806884228,
  },
  {
    date: '2023-12-29T15:00:00.000Z',
    value: 1.805510488640171,
  },
  {
    date: '2023-12-30T15:00:00.000Z',
    value: 1.7270882083331345,
  },
  {
    date: '2023-12-31T15:00:00.000Z',
    value: 1.5969348497458271,
  },
  {
    date: '2024-01-01T15:00:00.000Z',
    value: 1.5812971316088875,
  },
  {
    date: '2024-01-02T15:00:00.000Z',
    value: 1.539980833201578,
  },
  {
    date: '2024-01-03T15:00:00.000Z',
    value: 1.478206981634952,
  },
  {
    date: '2024-01-04T15:00:00.000Z',
    value: 1.4127277800252656,
  },
  {
    date: '2024-01-05T15:00:00.000Z',
    value: 1.3655993765472456,
  },
  {
    date: '2024-01-06T15:00:00.000Z',
    value: 1.2326186164896247,
  },
  {
    date: '2024-01-07T15:00:00.000Z',
    value: 1.2160019250937986,
  },
  {
    date: '2024-01-08T15:00:00.000Z',
    value: 1.3987631822047892,
  },
  {
    date: '2024-01-09T15:00:00.000Z',
    value: 1.4877394290000368,
  },
  {
    date: '2024-01-10T15:00:00.000Z',
    value: 1.5249696986974608,
  },
  {
    date: '2024-01-11T15:00:00.000Z',
    value: 1.5445013310269344,
  },
  {
    date: '2024-01-12T15:00:00.000Z',
    value: 1.649414852654034,
  },
  {
    date: '2024-01-13T15:00:00.000Z',
    value: 1.7669486445719058,
  },
  {
    date: '2024-01-14T15:00:00.000Z',
    value: 1.8584785765358958,
  },
  {
    date: '2024-01-15T15:00:00.000Z',
    value: 1.96709492859253,
  },
  {
    date: '2024-01-16T15:00:00.000Z',
    value: 2.047436934631888,
  },
  {
    date: '2024-01-17T15:00:00.000Z',
    value: 2.0618323820051008,
  },
  {
    date: '2024-01-18T15:00:00.000Z',
    value: 2.172522482463743,
  },
  {
    date: '2024-01-19T15:00:00.000Z',
    value: 2.2326333568863674,
  },
  {
    date: '2024-01-20T15:00:00.000Z',
    value: 2.1209351676694697,
  },
  {
    date: '2024-01-21T15:00:00.000Z',
    value: 2.110404995768294,
  },
  {
    date: '2024-01-22T15:00:00.000Z',
    value: 2.0871443496145172,
  },
  {
    date: '2024-01-23T15:00:00.000Z',
    value: 1.9907233988693704,
  },
  {
    date: '2024-01-24T15:00:00.000Z',
    value: 1.9275274926665347,
  },
  {
    date: '2024-01-25T15:00:00.000Z',
    value: 1.7519884194703943,
  },
  {
    date: '2024-01-26T15:00:00.000Z',
    value: 1.5804061479126894,
  },
  {
    date: '2024-01-27T15:00:00.000Z',
    value: 1.501259980549418,
  },
  {
    date: '2024-01-28T15:00:00.000Z',
    value: 1.3679404550427678,
  },
  {
    date: '2024-01-29T15:00:00.000Z',
    value: 1.3531137293201394,
  },
  {
    date: '2024-01-30T15:00:00.000Z',
    value: 1.246325564647899,
  },
  {
    date: '2024-01-31T15:00:00.000Z',
    value: 1.1639129885101294,
  },
  {
    date: '2024-02-01T15:00:00.000Z',
    value: 1.291178081602519,
  },
  {
    date: '2024-02-02T15:00:00.000Z',
    value: 1.329949544151064,
  },
  {
    date: '2024-02-03T15:00:00.000Z',
    value: 1.417950160748537,
  },
  {
    date: '2024-02-04T15:00:00.000Z',
    value: 1.468089635717835,
  },
  {
    date: '2024-02-05T15:00:00.000Z',
    value: 1.5315700702509425,
  },
  {
    date: '2024-02-06T15:00:00.000Z',
    value: 1.5444378248973447,
  },
  {
    date: '2024-02-07T15:00:00.000Z',
    value: 1.5745962619882052,
  },
  {
    date: '2024-02-08T15:00:00.000Z',
    value: 1.68206772602385,
  },
  {
    date: '2024-02-09T15:00:00.000Z',
    value: 1.712952570118657,
  },
  {
    date: '2024-02-10T15:00:00.000Z',
    value: 1.7662212830719495,
  },
  {
    date: '2024-02-11T15:00:00.000Z',
    value: 1.7943150717761764,
  },
  {
    date: '2024-02-12T15:00:00.000Z',
    value: 1.9238456658557417,
  },
];
