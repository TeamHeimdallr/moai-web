import Analytics from 'analytics';

import { IS_DEVNET, IS_LOCAL, IS_MAINNET } from '~/constants';

export const analytics = Analytics({
  app: IS_MAINNET
    ? 'moai-finance--mainnet'
    : IS_DEVNET
    ? 'moai-finance--devnet'
    : 'moai-finance--local',

  plugins: IS_LOCAL ? [] : [],
});
