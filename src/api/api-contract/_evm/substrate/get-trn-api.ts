import { ApiPromise } from '@polkadot/api';
import { getApiOptions, getPublicProvider, NetworkName } from '@therootnetwork/api';

export const getTrnApi = async (name: NetworkName) => {
  const api = await ApiPromise.create({
    noInitWarn: true,
    ...getApiOptions(),
    ...getPublicProvider(name),
  });

  return api;
};
