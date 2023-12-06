import googleTagManager from '@analytics/google-tag-manager';
import Analytics from 'analytics';

import { IS_DEVNET, IS_MAINNET } from '~/constants';

export const analytics = Analytics({
  app: IS_MAINNET
    ? 'moai-finance--mainnet'
    : IS_DEVNET
    ? 'moai-finance--devnet'
    : 'moai-finance--local',

  plugins: [
    googleTagManager({
      containerId: IS_MAINNET ? 'GT-P3HWJM8' : 'GT-PZQ9GG3',
    }),
  ],
});
