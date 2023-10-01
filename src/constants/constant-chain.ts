import { ChainLinea, ChainMantle, ChainROOT, ChainXRPL, IconWeb } from '~/assets/images';

import { ChainSelectList } from '~/types';

export const CHAIN_IMAGE_MAPPER: Record<string, string> = {
  MANTLE: ChainMantle,
  LINEA: ChainLinea,
  ROOT: ChainROOT,
  XRPL: ChainXRPL,
  EMPTY: IconWeb,
  XRPEVM: ChainXRPL, // TODO
};

export const CHAIN_SELECT_LIST: ChainSelectList[] = [
  { name: 'root', text: 'The Root Network', show: true },
  { name: 'xrpl', text: 'XRPL', show: true },
  { name: 'evm-sidechain', text: 'EVM Sidechain', show: true, commingSoon: true, disabled: true },
];
