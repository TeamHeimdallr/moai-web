/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react';
import { getName } from '@ensdomains/ensjs/public';
import { Address, usePublicClient } from 'wagmi';

export const Test = () => {
  const publicClient = usePublicClient();

  const addresses = data.map(d => d.address);

  useEffect(() => {
    const fetch = async () => {
      const res = await Promise.all(
        addresses.map(address => getName(publicClient as any, { address: address as Address }))
      );
      console.log(res);
    };

    fetch();
  }, [addresses, publicClient]);

  return <></>;
};

const data = [
  {
    id: 3475,
    rank: 1,
    address: '0xFFfFfFFF00000000000000000000000000001188',
    lpSupply: 0,
    lendingSupply: 105335.77035564621,
    referees: 5266.788517782491,
    total: 110602.5588734287,
    boost: 1.5,
  },
  {
    id: 3450,
    rank: 2,
    address: '0xFfFfFffF000000000000000000000000000010BD',
    lpSupply: 897.9056945162424,
    lendingSupply: 43129.89389234274,
    referees: 4541.442530455955,
    total: 48569.24211731495,
    boost: 1.5,
  },
  {
    id: 3939,
    rank: 3,
    address: '0x0ddA0F737e2d34a7671fD192B377bcdCAf2b6915',
    lpSupply: 6009.774722703273,
    lendingSupply: 35498.597225061254,
    referees: 0,
    total: 41508.37194776453,
    boost: 1.5,
  },
  {
    id: 3493,
    rank: 4,
    address: '0xFFFFfFff00000000000000000000000000000f55',
    lpSupply: 34.25604166940616,
    lendingSupply: 35767.497433416735,
    referees: 2569.6647108536017,
    total: 38371.41818593974,
    boost: 1.5,
  },
  {
    id: 4346,
    rank: 5,
    address: '0x32819bFB144a6023f2bA1Cbd7247dA68faCc8352',
    lpSupply: 21116.520418354463,
    lendingSupply: 14221.507640026635,
    referees: 1766.9014029191835,
    total: 37104.92946130029,
    boost: 1.5,
  },
  {
    id: 3557,
    rank: 6,
    address: '0xfFffFFff00000000000000000000000000001116',
    lpSupply: 5867.709306024773,
    lendingSupply: 27208.630696622473,
    referees: 1653.8170001324493,
    total: 34730.15700277968,
    boost: 1.5,
  },
  {
    id: 3432,
    rank: 7,
    address: '0xffFFFFfF000000000000000000000000000003E4',
    lpSupply: 24307.875488054873,
    lendingSupply: 3244.0879863704226,
    referees: 1377.5981737213074,
    total: 28929.5616481466,
    boost: 1.5,
  },
  {
    id: 3602,
    rank: 8,
    address: '0xa1Dfd9b90e8B1579a60b391713C0DbBF5588a8DB',
    lpSupply: 2693.717083548786,
    lendingSupply: 23682.0850018944,
    referees: 1299.90651052067,
    total: 27675.70859596386,
    boost: 1.5,
  },
  {
    id: 3445,
    rank: 9,
    address: '0xfFFFfffF0000000000000000000000000000113c',
    lpSupply: 2693.717083548786,
    lendingSupply: 23430.085001874246,
    referees: 1306.1901042711734,
    total: 27429.9921896942,
    boost: 1.5,
  },
  {
    id: 3542,
    rank: 10,
    address: '0xfFfFffFf00000000000000000000000000000d0A',
    lpSupply: 9294.27569518827,
    lendingSupply: 12317.13902876265,
    referees: 2107.6692825759937,
    total: 23719.08400652691,
    boost: 1.5,
  },
  {
    id: 3357,
    rank: 11,
    address: '0xFFFfFFFf00000000000000000000000000000BbD',
    lpSupply: 2004.626666827092,
    lendingSupply: 20077.33257104959,
    referees: 0,
    total: 22081.95923787668,
    boost: 1.5,
  },
  {
    id: 3605,
    rank: 12,
    address: '0xffffFFfF0000000000000000000000000000128a',
    lpSupply: 125.28916667669326,
    lendingSupply: 11200.580000895736,
    referees: 10533.57703556498,
    total: 21859.44620313741,
    boost: 1,
  },
  {
    id: 3641,
    rank: 13,
    address: '0xffffFFFf00000000000000000000000000037430',
    lpSupply: 3676.429514183057,
    lendingSupply: 16037.022015171913,
    referees: 985.672576467679,
    total: 20699.12410582265,
    boost: 1.5,
  },
  {
    id: 3618,
    rank: 14,
    address: '0xFFFfffFF000000000000000000000000000390db',
    lpSupply: 18438.389029252776,
    lendingSupply: 0,
    referees: 0,
    total: 18438.38902925278,
    boost: 1.5,
  },
  {
    id: 4094,
    rank: 15,
    address: '0xfFfFfFff000000000000000000000000000011f2',
    lpSupply: 194.89425927485826,
    lendingSupply: 17122.766621740655,
    referees: 865.8830440507239,
    total: 18183.54392506623,
    boost: 1,
  },
  {
    id: 3548,
    rank: 16,
    address: '0xFffFffFF000000000000000000000000000370D6',
    lpSupply: 354.9859722506251,
    lendingSupply: 17199.66139026521,
    referees: 0,
    total: 17554.64736251584,
    boost: 1.5,
  },
  {
    id: 3764,
    rank: 17,
    address: '0x7444facaE189CFd0F9f6a37f804aad915C752153',
    lpSupply: 17540.483334735185,
    lendingSupply: 0,
    referees: 0,
    total: 17540.48333473519,
    boost: 1.5,
  },
  {
    id: 3727,
    rank: 18,
    address: '0xfFffFFFF0000000000000000000000000000107B',
    lpSupply: 11796.912709276696,
    lendingSupply: 3271.0469447061846,
    referees: 0,
    total: 15067.95965398288,
    boost: 1.5,
  },
  {
    id: 3969,
    rank: 19,
    address: '0xEEc00e935669C814bBE6B7881d406f4c91c7772d',
    lpSupply: 15055.581528982912,
    lendingSupply: 0,
    referees: 0,
    total: 15055.58152898291,
    boost: 1.5,
  },
  {
    id: 3562,
    rank: 20,
    address: '0xFFFfFfff00000000000000000000000000000D9d',
    lpSupply: 8102.032778425668,
    lendingSupply: 5658.894028230242,
    referees: 0,
    total: 13760.92680665591,
    boost: 1.5,
  },

  {
    id: 3475,
    rank: 21,
    address: '0xfFfFffff00000000000000000000000000035799',
    lpSupply: 0,
    lendingSupply: 105335.77035564621,
    referees: 5266.788517782491,
    total: 110602.5588734287,
    boost: 1.5,
  },
];
