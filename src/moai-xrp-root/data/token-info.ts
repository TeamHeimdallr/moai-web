import { TokenROOT, TokenXRP } from '~/assets/images';

import { CHAIN_ID, TOKEN_ADDRESS } from '~/moai-evm/constants';

import { TokenInfo } from '~/moai-evm/types/contracts';

export const tokenInfos: TokenInfo[] = [
  {
    chainId: CHAIN_ID,
    address: TOKEN_ADDRESS.ROOT,
    name: 'Root',
    symbol: 'ROOT',
    decimals: 6,
    logoURI: TokenROOT,
  },
  {
    chainId: CHAIN_ID,
    address: TOKEN_ADDRESS.XRP,
    name: 'XRP',
    symbol: 'XRP',
    decimals: 6,
    logoURI: TokenXRP,
  },
];
