import { set, sub } from 'date-fns';

import { ASSET_URL } from '~/constants';

import { IChartXYData, NETWORK } from '~/types';

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

export const supplyAprDataStaticAll = [
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

export const supplyAprDataStatic24h = [
  {
    date: '2024-02-12T15:30:00.000Z',
    value: 2.567021592351553,
  },
  {
    date: '2024-02-12T16:00:00.000Z',
    value: 2.5185106191544664,
  },
  {
    date: '2024-02-12T16:30:00.000Z',
    value: 2.456768904426147,
  },
  {
    date: '2024-02-12T17:00:00.000Z',
    value: 2.305653450329786,
  },
  {
    date: '2024-02-12T17:30:00.000Z',
    value: 2.1591242313269525,
  },
  {
    date: '2024-02-12T18:00:00.000Z',
    value: 1.9686581964188103,
  },
  {
    date: '2024-02-12T18:30:00.000Z',
    value: 1.8338282033682427,
  },
  {
    date: '2024-02-12T19:00:00.000Z',
    value: 1.6634775675910978,
  },
  {
    date: '2024-02-12T19:30:00.000Z',
    value: 1.5164331982710113,
  },
  {
    date: '2024-02-12T20:00:00.000Z',
    value: 1.33991593642644,
  },
  {
    date: '2024-02-12T20:30:00.000Z',
    value: 1.239145592142869,
  },
  {
    date: '2024-02-12T21:00:00.000Z',
    value: 1.0500455305303045,
  },
  {
    date: '2024-02-12T21:30:00.000Z',
    value: 1.2298882009284293,
  },
  {
    date: '2024-02-12T22:00:00.000Z',
    value: 1.3099685231028653,
  },
  {
    date: '2024-02-12T22:30:00.000Z',
    value: 1.4738500719763417,
  },
  {
    date: '2024-02-12T23:00:00.000Z',
    value: 1.5869335961210354,
  },
  {
    date: '2024-02-12T23:30:00.000Z',
    value: 1.6099105425805866,
  },
  {
    date: '2024-02-13T00:00:00.000Z',
    value: 1.6685942379475178,
  },
  {
    date: '2024-02-13T00:30:00.000Z',
    value: 1.8017720432272561,
  },
  {
    date: '2024-02-13T01:00:00.000Z',
    value: 1.8927285580164586,
  },
  {
    date: '2024-02-13T01:30:00.000Z',
    value: 2.065804890818644,
  },
  {
    date: '2024-02-13T02:00:00.000Z',
    value: 2.0822741680696,
  },
  {
    date: '2024-02-13T02:30:00.000Z',
    value: 2.1355067061600326,
  },
  {
    date: '2024-02-13T03:00:00.000Z',
    value: 2.3079796222460116,
  },
  {
    date: '2024-02-13T03:30:00.000Z',
    value: 2.131743939885061,
  },
  {
    date: '2024-02-13T04:00:00.000Z',
    value: 2.064357454418755,
  },
  {
    date: '2024-02-13T04:30:00.000Z',
    value: 1.87566175166354,
  },
  {
    date: '2024-02-13T05:00:00.000Z',
    value: 1.742915801553559,
  },
  {
    date: '2024-02-13T05:30:00.000Z',
    value: 1.704636108137601,
  },
  {
    date: '2024-02-13T06:00:00.000Z',
    value: 1.672670493388151,
  },
  {
    date: '2024-02-13T06:30:00.000Z',
    value: 1.5364549316124931,
  },
  {
    date: '2024-02-13T07:00:00.000Z',
    value: 1.4298741816967089,
  },
  {
    date: '2024-02-13T07:30:00.000Z',
    value: 1.2489057597585274,
  },
  {
    date: '2024-02-13T08:00:00.000Z',
    value: 1.0927459681452825,
  },
  {
    date: '2024-02-13T08:30:00.000Z',
    value: 0.9155346419016069,
  },
  {
    date: '2024-02-13T09:00:00.000Z',
    value: 0.8593697027285441,
  },
  {
    date: '2024-02-13T09:30:00.000Z',
    value: 0.880899143000806,
  },
  {
    date: '2024-02-13T10:00:00.000Z',
    value: 0.8982626332251552,
  },
  {
    date: '2024-02-13T10:30:00.000Z',
    value: 0.9241242065926567,
  },
  {
    date: '2024-02-13T11:00:00.000Z',
    value: 1.05500385165232,
  },
  {
    date: '2024-02-13T11:30:00.000Z',
    value: 1.1605077686585077,
  },
  {
    date: '2024-02-13T12:00:00.000Z',
    value: 1.1734680658241414,
  },
  {
    date: '2024-02-13T12:30:00.000Z',
    value: 1.290092842504198,
  },
  {
    date: '2024-02-13T13:00:00.000Z',
    value: 1.445561544347993,
  },
  {
    date: '2024-02-13T13:30:00.000Z',
    value: 1.6454768218358538,
  },
  {
    date: '2024-02-13T14:00:00.000Z',
    value: 1.7985740035450481,
  },
  {
    date: '2024-02-13T14:30:00.000Z',
    value: 1.8539495792778458,
  },
  {
    date: '2024-02-13T15:00:00.000Z',
    value: 1.9933769996473973,
  },
];

export const interestRateModelData: IChartXYData[] = Array.from({ length: 202 }).map((_, i) => {
  const x = i * 0.5;
  if (i < 150) return { x, y: 0 + i * 0.01 };
  return { x, y: 150 * 0.01 + (i - 150) * 1 };
});
