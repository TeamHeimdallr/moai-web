import googleAnalytics from '@analytics/google-analytics';
import googleTagManager from '@analytics/google-tag-manager';
import Analytics from 'analytics';

import { GA_DEVNET, GA_MAINNET, GTM_DEVNET, GTM_MAINNET, IS_DEVNET, IS_MAINNET } from '~/constants';

export const analytics = Analytics({
  app: IS_MAINNET
    ? 'moai-finance--mainnet'
    : IS_DEVNET
    ? 'moai-finance--devnet'
    : 'moai-finance--local',

  plugins: [
    googleAnalytics({
      measurementIds: [IS_MAINNET ? GA_MAINNET : GA_DEVNET],
    }),
    googleTagManager({
      containerId: IS_MAINNET ? GTM_MAINNET : GTM_DEVNET,
    }),
  ],
});
