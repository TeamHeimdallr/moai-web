import tokenMNT from '~/assets/images/token-mnt.png';
import tokenMOAI from '~/assets/images/token-moai.png';
import tokenUSDC from '~/assets/images/token-usdc.png';
import tokenUSDT from '~/assets/images/token-usdt.png';
import tokenWETH from '~/assets/images/token-weth.png';
import { CHAIN_ID } from '~/constants';
import { TokenInfo } from '~/types/contracts';

export const tokenInfos: TokenInfo[] = [
  {
    chainId: CHAIN_ID.MANTLE_TESTNET,
    address: '0xcBdaCEaE8660BE805Deaf36A210c770989Ed4888',
    name: 'USD Coin (PoS)',
    symbol: 'USDC',
    decimals: 6,
    logoURI: tokenUSDC,
  },

  {
    chainId: CHAIN_ID.MANTLE_TESTNET,
    address: '0xF01C2F30D8e7DCa8D589B66B4cC5214c8Eb993E4',
    name: '(PoS) Tether USD',
    symbol: 'USDT',
    decimals: 6,
    logoURI: tokenUSDT,
  },
  {
    chainId: CHAIN_ID.MANTLE_TESTNET,
    address: '0xd1A5c7Dd009e578bf4aC8f9392D1fFdbC27B86BB',
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
    logoURI: tokenWETH,
  },
  {
    chainId: CHAIN_ID.MANTLE_TESTNET,
    address: '0x',
    name: 'Mantle',
    symbol: 'MNT',
    decimals: 18,
    logoURI: tokenMNT,
  },
  {
    chainId: CHAIN_ID.MANTLE_TESTNET,
    address: '0xaf5F3781678a0Bd4258cB4e9885b26E6629b7930',
    name: 'Moai',
    symbol: 'MOAI',
    decimals: 18,
    logoURI: tokenMOAI,
  },
];
