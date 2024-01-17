import { differenceInSeconds } from 'date-fns';
import { Abi, Address, formatEther, formatUnits } from 'viem';
import { useContractRead } from 'wagmi';

import { useGetCampaignsQuery } from '~/api/api-server/campaign/get-campaigns';
import { useGetPoolQuery } from '~/api/api-server/pools/get-pool';

import { CAMPAIGN_ADDRESS, POOL_ID } from '~/constants';

import { useNetwork } from '~/hooks/contexts/use-network';
import { NETWORK } from '~/types';

import { BALANCER_LP_ABI, ERC20_TOKEN_ABI } from '~/abi';

export const useCampaignLpBalance = () => {
  const { selectedNetwork } = useNetwork();

  const isRoot = selectedNetwork === NETWORK.THE_ROOT_NETWORK;
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
  const { moiApr, apr: swapApr, lpToken } = pool || {};

  const poolAddress = pool?.address;
  const lpTokenAddress = lpToken?.address;
  const apr = (moiApr || 0) + (swapApr || 0) + 10; // moiApr + swapApr + 10% (10% is the fixed ROOT APR)

  const { data } = useContractRead({
    address: lpTokenAddress as Address,
    abi: ERC20_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [CAMPAIGN_ADDRESS[NETWORK.THE_ROOT_NETWORK]],
    staleTime: 1000 * 3,
    enabled: !!enabled && !!lpTokenAddress && isRoot,
  });

  const { data: lpTokenTotalSupplyData } = useContractRead({
    address: poolAddress as Address,
    abi: BALANCER_LP_ABI as Abi,
    functionName: 'totalSupply',

    staleTime: 1000 * 3,
    enabled: !!poolAddress && isRoot,
  });

  const lpTokenTotalSupply = Number(formatEther((lpTokenTotalSupplyData || 0n) as bigint));
  const lpTokenPrice = Number(lpTokenTotalSupply ? (pool?.value || 0) / lpTokenTotalSupply : 0);

  const balance = Number(formatUnits((data || 0n) as bigint, 18));
  const value = balance * lpTokenPrice;

  return {
    balance,
    balanceRaw: data || 0n,

    value,

    apr,
    moiApr,
  };
};
