import tokenMOAI from '~/assets/images/token-moai.png';
import tokenWETH from '~/assets/images/token-weth.png';

import { CHAIN_ID, TOKEN_ADDRESS } from '~/moai-evm/constants';

import { TokenInfo } from '~/moai-evm/types/contracts';

export const tokenInfos: TokenInfo[] = [
  {
    chainId: CHAIN_ID,
    address: TOKEN_ADDRESS.MOAI,
    name: 'Moai',
    symbol: 'MOAI',
    decimals: 18,
    logoURI: tokenMOAI,
  },
  {
    chainId: CHAIN_ID,
    address: TOKEN_ADDRESS.WETH,
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
    logoURI: tokenWETH,
  },
];
