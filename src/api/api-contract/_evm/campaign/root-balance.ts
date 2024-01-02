import { differenceInSeconds } from 'date-fns';
import { Address, formatUnits } from 'viem';
import { useContractRead } from 'wagmi';

import { useGetCampaignsQuery } from '~/api/api-server/campaign/get-campaigns';

import { CAMPAIGN_ADDRESS } from '~/constants';

import { NETWORK } from '~/types';

import { ERC20_TOKEN_ABI } from '~/abi';

export const useCampaignRootBalance = () => {
  const { data: campaignData } = useGetCampaignsQuery(
    {
      queries: {
        filter: `active:eq:true:boolean`,
      },
    },
    { staleTime: 5 * 60 * 1000 }
  );
  const campaigns = campaignData?.campaigns || [];

  const now = new Date();
  const campaignXrplRoot = campaigns.find(item => item.name === 'campaign-xrpl-root');
  const enabled =
    campaignXrplRoot && differenceInSeconds(new Date(campaignXrplRoot?.endDate), now) > 0;

  const { data } = useContractRead({
    address: '0xcCcCCccC00000001000000000000000000000000' as Address,
    abi: ERC20_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [CAMPAIGN_ADDRESS[NETWORK.THE_ROOT_NETWORK]],
    staleTime: 1000 * 3,
    enabled,
  });

  const balance = Number(formatUnits((data || 0n) as bigint, 6));
  return {
    balance,
    balanceRaw: data || 0n,
  };
};
