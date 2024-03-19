import { IS_MAINNET } from '~/constants';

export const getRootTokenIdFromTokenSymbol = (tokenSymbol: string): number => {
  switch (tokenSymbol) {
    case 'ROOT':
      return IS_MAINNET ? 1 : 1;
    case 'ETH':
      return IS_MAINNET ? 1124 : 1124;
    case 'USDC':
      return IS_MAINNET ? 3172 : 2148;
    case 'USDT':
      return IS_MAINNET ? 6244 : 2148;
    default:
      return 0;
  }
};

export const getEthBridgeContractAddressFromTokneSymbol = (tokenSymbol: string): string => {
  switch (tokenSymbol) {
    case 'ROOT':
      return IS_MAINNET
        ? '0x7556085E8e6A1Dabbc528fbcA2C7699fA5Ee6e11'
        : '0x5C752e9D3ECC8DB4B4B5A84052399f3618C332BF';
    default:
      return IS_MAINNET
        ? '0xE9410B5AA32b270154c37752EcC0607c8c7aBC5F'
        : '0x881339EeFd1DC8D60CEFBfE93294D0eeC24Fb8Cc';
  }
};

export const getEthBridgeContractAddressFromTokneId = (tokenId: number): string => {
  switch (tokenId) {
    case 1:
      return IS_MAINNET
        ? '0x7556085E8e6A1Dabbc528fbcA2C7699fA5Ee6e11'
        : '0x5C752e9D3ECC8DB4B4B5A84052399f3618C332BF';
    default:
      return IS_MAINNET
        ? '0xE9410B5AA32b270154c37752EcC0607c8c7aBC5F'
        : '0x881339EeFd1DC8D60CEFBfE93294D0eeC24Fb8Cc';
  }
};
