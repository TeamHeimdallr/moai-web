import { Client } from 'xrpl';

import { XRPL_WSS_TEST_NET } from '~/moai-xrp-ledger/constants';

const client = new Client(XRPL_WSS_TEST_NET);
export default client;
