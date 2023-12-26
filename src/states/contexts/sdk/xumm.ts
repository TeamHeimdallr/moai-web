import { XummPkce } from 'xumm-oauth2-pkce';
import { XummSdk } from 'xumm-sdk';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { XUMM_API_KEY, XUMM_API_SECRET } from '~/constants';

import { logger } from '~/states/middleware/logger';

const xummSDK = new XummSdk(XUMM_API_KEY, XUMM_API_SECRET);
const xummAuthSDK = new XummPkce(XUMM_API_KEY);

interface State {
  client: XummSdk;
  authClient: XummPkce;
}

export const useXummStore = create<State>()(
  immer(
    logger(_set => ({
      name: 'XUMM_SDK_STORE',
      client: xummSDK,
      authClient: xummAuthSDK,
    }))
  )
);
