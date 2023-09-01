import tokenMOAI from '~/assets/images/token-moai.png';
import tokenUSDC from '~/assets/images/token-usdc.png';
import tokenUSDT from '~/assets/images/token-usdt.png';
import tokenWETH from '~/assets/images/token-weth.png';
import { CHAIN_ID, TOKEN_ADDRESS } from '~/constants';
import { TokenInfo } from '~/types/contracts';

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
  {
    chainId: CHAIN_ID,
    address: TOKEN_ADDRESS.USDC,
    name: 'USD Coin (PoS)',
    symbol: 'USDC',
    decimals: 6,
    logoURI: tokenUSDC,
  },

  {
    chainId: CHAIN_ID,
    address: TOKEN_ADDRESS.USDT,
    name: '(PoS) Tether USD',
    symbol: 'USDT',
    decimals: 6,
    logoURI: tokenUSDT,
  },
];
