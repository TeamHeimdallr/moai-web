import { differenceInSeconds } from 'date-fns';
import { Address, formatUnits } from 'viem';
import { useContractRead } from 'wagmi';

import { useGetCampaignsQuery } from '~/api/api-server/campaign/get-campaigns';
import { useGetPoolQuery } from '~/api/api-server/pools/get-pool';

import { CAMPAIGN_ADDRESS, POOL_ID } from '~/constants';

import { NETWORK } from '~/types';

import { ERC20_TOKEN_ABI } from '~/abi';

export const useCampaignLpBalance = () => {
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

  const { data: poolData } = useGetPoolQuery(
    {
      params: {
        networkAbbr: 'trn',
        poolId: POOL_ID[NETWORK.THE_ROOT_NETWORK].ROOT_XRP,
      },
    },
    { staleTime: Infinity, cacheTime: Infinity, enabled }
  );

  const { pool } = poolData || {};
  const { moiApr, lpToken } = pool || {};

  const lpTokenAddress = lpToken?.address;
  const apr = (moiApr || 0) + 10; // moiApr + 10% (10% is the fixed ROOT APR)

  const { data } = useContractRead({
    address: lpTokenAddress as Address,
    abi: ERC20_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [CAMPAIGN_ADDRESS[NETWORK.THE_ROOT_NETWORK]],
    staleTime: 1000 * 3,
    enabled: !!enabled && !!lpTokenAddress,
  });

  const balance = Number(formatUnits((data || 0n) as bigint, 18));
  return {
    balance,
    balanceRaw: data || 0n,

    apr,
    moiApr,
  };
};
