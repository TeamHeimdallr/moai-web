import { useQuery } from '@tanstack/react-query';
import { AMMInfoRequest, Currency } from 'xrpl';

import { useXrpl } from '~/hooks/contexts';
import { useNetwork } from '~/hooks/contexts/use-network';

interface Props {
  asset: Currency;
  asset2: Currency;

  enabled?: boolean;
}
export const useAmmInfo = ({ asset, asset2, enabled = true }: Props) => {
  const { isXrp } = useNetwork();
  const { client, isConnected } = useXrpl();

  const request = {
    command: 'amm_info',
    asset,
    asset2,
  } as AMMInfoRequest;

  const getAmmInfo = async () => {
    if (!isXrp) throw new Error('Invalid network');

    return (await client.request(request))?.result;
  };

  const res = useQuery(['GET', 'XRPL', 'AMM_INFO', request], getAmmInfo, {
    enabled: !!client && isConnected && isXrp && enabled,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60,
  });

  return res;
};
