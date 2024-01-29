import { useQuery } from '@tanstack/react-query';
import { AccountInfoRequest, AccountInfoResponse } from 'xrpl';

import { useXrpl } from '~/hooks/contexts';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';

interface Props {
  account: string;
  enabled?: boolean;
}
export const useAccountInfo = ({ account, enabled }: Props) => {
  const { isXrp } = useNetwork();
  const { client, isConnected } = useXrpl();
  const { xrp } = useConnectedWallet();
  const { address } = xrp;

  const targetAccount = account || address;
  const getAccountInfoRequest = {
    command: 'account_info',
    account: targetAccount,
  } as AccountInfoRequest;

  const getAccountInfo = async () => {
    if (!isXrp) return {} as AccountInfoResponse['result'];
    return (await client.request(getAccountInfoRequest))?.result;
  };

  const {
    isLoading,
    isSuccess,
    data: accountInfo,
    refetch,
  } = useQuery(['XRPL', 'ACCOUNT_INFO', address], getAccountInfo, {
    enabled: !!client && isConnected && !!targetAccount && isXrp && enabled,
  });

  return {
    isLoading,
    isSuccess,
    accountInfo,
    refetch,
  };
};
