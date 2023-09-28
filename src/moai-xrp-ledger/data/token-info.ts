import { TokenMOAI, TokenXRP } from '~/assets/images';

import { TokenInfo } from '~/moai-xrp-ledger/types/contracts';

import { ISSUER } from '../constants';

export const tokenInfos: TokenInfo[] = [
  {
    issuer: '',
    name: 'XRP',
    logoURI: TokenXRP,
  },
  {
    issuer: ISSUER.MOI,
    name: 'MOI',
    logoURI: TokenMOAI,
  },
];
