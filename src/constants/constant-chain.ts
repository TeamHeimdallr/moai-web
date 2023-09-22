import { ChainLinea, ChainMantle, ChainROOT, ChainXRPL } from '~/assets/images';

import { ChainSelectList } from '~/types';

export const CHAIN_IMAGE_MAPPER: Record<string, string> = {
  MANTLE: ChainMantle,
  LINEA: ChainLinea,
  ROOT: ChainROOT,
  XRPL: ChainXRPL,
};

export const CHAIN_SELECT_LIST: ChainSelectList[] = [
  { name: 'mantle', text: 'Mantle' },
  { name: 'linea', text: 'Linea' },
  { name: 'root', text: 'The Root Network', show: true },
  { name: 'xrpl', text: 'XRPL', show: true, disabled: true, commingSoon: true },
];
