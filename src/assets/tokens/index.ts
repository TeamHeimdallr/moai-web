import tokenMOAI from '~/assets/images/token-moai.png';
import tokenWETH from '~/assets/images/token-weth.png';
import { CHAIN, CHAIN_ID, TOKEN_ADDRESS } from '~/constants';
import { TokenInfo } from '~/types/contracts';

import { TokenROOT, TokenXRPL } from '../images';

const tokenInfosMantleLinea: TokenInfo[] = [
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
const tokenInfosRoot: TokenInfo[] = [
  {
    chainId: CHAIN_ID,
    address: TOKEN_ADDRESS.ROOT,
    name: 'ROOT',
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
    logoURI: TokenXRPL,
  },
];

export const tokenInfos = CHAIN === 'root' ? tokenInfosRoot : tokenInfosMantleLinea;
