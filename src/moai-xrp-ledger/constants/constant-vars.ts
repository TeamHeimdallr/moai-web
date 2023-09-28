import { TokenMOAI, TokenXRP } from '~/assets/images';

import { GnbMenu } from '~/types';

export const TOKEN_DECIAML = 6;
export const TOKEN_IMAGE_MAPPER: Record<string, string> = {
  MOI: TokenMOAI,
  XRP: TokenXRP,
  '50XRP-50MOI': TokenXRP,
};

export const TOKEN_USD_MAPPER: Record<string, number> = {
  MOI: 10.23,
  XRP: 0.5,
};

export const TOKEN_DESCRIPTION_MAPPER: Record<string, string> = {
  MOI: 'MOAI Finance Token',
  XRP: 'XRP',
  '50XRP-50MOI': '50MOAI-50XRP LP Token',
};

export const GNB_MENU: GnbMenu[] = [
  {
    id: 'pool',
    text: 'Pool',
    path: '/',
  },
  {
    id: 'swap',
    text: 'Swap',
    path: '/swap',
  },
  {
    id: 'launchpad',
    text: 'Launchpad',
    path: '/',
    disabled: true,
    commingSoon: true,
  },
  {
    id: 'rewards',
    text: 'Rewards',
    path: '/',
    disabled: true,
    commingSoon: true,
  },
];
