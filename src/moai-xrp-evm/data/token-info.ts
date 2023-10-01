import { TokenWETH, TokenXRP } from '~/assets/images';

import { CHAIN_ID, TOKEN_ADDRESS } from '~/moai-xrp-evm/constants';

import { TokenInfo } from '~/moai-xrp-evm/types/contracts';

export const tokenInfos: TokenInfo[] = [
  {
    chainId: CHAIN_ID,
    address: TOKEN_ADDRESS.WETH,
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
    logoURI: TokenWETH,
  },
  {
    chainId: CHAIN_ID,
    address: TOKEN_ADDRESS.WXRP,
    name: 'WXRP',
    symbol: 'WXRP',
    decimals: 18,
    logoURI: TokenXRP,
  },
];
