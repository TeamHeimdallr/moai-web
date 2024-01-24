import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useParams } from 'react-router';
import { css } from '@emotion/react';
import { differenceInSeconds, intervalToDuration } from 'date-fns';
import { debounce } from 'lodash-es';
import tw, { styled } from 'twin.macro';

import { useCampaignInfo } from '~/api/api-contract/_evm/campaign/campaign-info';
import { useClaim } from '~/api/api-contract/_evm/campaign/claim';
import {
  useClaim as useClaimSubstrate,
  useClaimPrepare,
} from '~/api/api-contract/_evm/campaign/claim-substrate';
import { useUserCampaignInfo } from '~/api/api-contract/_evm/campaign/user-campaign-info.ts';
import { useUserAllTokenBalances } from '~/api/api-contract/balance/user-all-token-balances';
import { useUserPoolTokenBalances } from '~/api/api-contract/balance/user-pool-token-balances';
import { useGetCampaignsQuery } from '~/api/api-server/campaign/get-campaigns';
import { useGetPoolQuery } from '~/api/api-server/pools/get-pool';
import { useGetRewardsInfoQuery } from '~/api/api-server/rewards/get-reward-info';

import { IconNext, IconTokenMoai, IconTokenRoot } from '~/assets/icons';

import { BASE_URL, POOL_ID } from '~/constants';

import { ButtonPrimaryLarge, ButtonPrimaryMediumIconTrailing } from '~/components/buttons';
import { ButtonPrimaryLargeIconTrailing } from '~/components/buttons/primary/large-icon-trailing';

import { TokenListVertical } from '~/pages/campaign/pages/landing/components/token-list-vertical';
import { WithdrawLiquidityPopup } from '~/pages/campaign/pages/landing/components/withdraw-liquidity-popup';

import { useGAAction } from '~/hooks/analaystics/ga-action';
import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useMediaQuery } from '~/hooks/utils';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkAbbr } from '~/utils';
import { NETWORK, POPUP_ID } from '~/types';

interface RemainLockupTime {
  hours: string;
  minutes: string;
  seconds: string;
}
export const CampaignTool = () => {
  const { gaAction } = useGAAction();

  const { id } = useParams();

  const { isMD } = useMediaQuery();
  const { t } = useTranslation();

  const [estimatedClaimFee, setEstimatedClaimFee] = useState<number | undefined>();

  const { isEvm, selectedNetwork, isFpass } = useNetwork();
  const { xrp, evm, fpass } = useConnectedWallet();
  const [now, setNow] = useState(new Date());
  const [remainTime, setRemainTime] = useState<RemainLockupTime>({
    hours: '00',
    minutes: '00',
    seconds: '00',
  });

  const walletAddress = isFpass ? fpass?.address : isEvm ? evm?.address : xrp?.address;
  const evmWalletAddress = isFpass ? fpass?.address : isEvm ? evm?.address : undefined;

  const { userAllTokenBalances } = useUserAllTokenBalances();

  const userXrp = userAllTokenBalances?.find(t => t.symbol === 'XRP');
  const userXrpBalance = userXrp?.balance || 0;

  const { data: campaignData } = useGetCampaignsQuery(
    { queries: { filter: `active:eq:true:boolean` } },
    { staleTime: 5 * 60 * 1000 }
  );
  const campaigns = campaignData?.campaigns || [];

  const campaignXrplRoot = campaigns.find(c => c.name === 'campaign-xrpl-root');
  const campaignStartDate = useMemo(
    () => new Date(campaignXrplRoot?.startDate || new Date()),
    [campaignXrplRoot?.startDate]
  );

  const started = differenceInSeconds(campaignStartDate, now) <= 0;

  const { data: rewardInfoData } = useGetRewardsInfoQuery(
    {
      params: { networkAbbr: 'trn' },
      queries: { walletAddress: evmWalletAddress },
    },
    { staleTime: 1000 * 3, enabled: !!evmWalletAddress }
  );

  const campaignReward = rewardInfoData?.myCampaignReward || 0;

  const {
    amountFarmedInBPT,
    depositedTime,

    rootReward,
    rootPrice,
    refetch: userCampaignInfoRefetch,
  } = useUserCampaignInfo();
  const isRoot = selectedNetwork === NETWORK.THE_ROOT_NETWORK;
  const poolId = POOL_ID?.[NETWORK.THE_ROOT_NETWORK]?.ROOT_XRP;

  const queryEnabled = !!isRoot && !!poolId;
  const { data: poolData } = useGetPoolQuery(
    {
      params: {
        networkAbbr: getNetworkAbbr(NETWORK.THE_ROOT_NETWORK) as string,
        poolId: poolId as string,
      },
    },
    {
      enabled: queryEnabled,
      staleTime: 1000,
    }
  );

  const { pool } = poolData || {};
  const { compositions } = pool || {};
  const xrpToken = compositions?.[1];
  const xrpBalanceInPool = xrpToken?.balance || 0;

  /* claim */
  const claimEvm = useClaim();
  const claimSubstrate = useClaimSubstrate();
  const { isPrepareError: claimSubstratePrepareIsError, prepareError: claimSubstratePrepareError } =
    useClaimPrepare();

  const claim = isFpass ? claimSubstrate : claimEvm;
  const {
    isLoading: claimLoading,
    isError: claimIsError,
    isSuccess: claimIsSuccess,
    txData: claimTxData,
    error: claimError,
    writeAsync,
    estimateFee: estimateClaimFee,
  } = claim;

  const isErrorRaw = claimIsError || claimSubstratePrepareIsError;
  const error = claimError || claimSubstratePrepareError;
  const approveError = error?.message?.includes('Approved');
  const isError = isErrorRaw && !approveError;
  const claimGasError = userXrpBalance < (estimatedClaimFee || 0);

  /* withdraw */
  const { opened: withdrawPopupOpened, open: withdrawPopupOpen } = usePopup(
    POPUP_ID.CAMPAIGN_WITHDRAW
  );

  const { lpTokenPrice, lpTokenTotalSupply, refetch } = useUserPoolTokenBalances({
    network: 'trn',
    id: POOL_ID?.[selectedNetwork]?.ROOT_XRP,
  });

  const { lockupPeriod } = useCampaignInfo();

  const myDepositBalance = amountFarmedInBPT;
  const myDepositValue = myDepositBalance * lpTokenPrice;

  const myDepositInXrp = 2 * (myDepositBalance / lpTokenTotalSupply) * xrpBalanceInPool;

  const nowTime = now.getTime() / 1000;
  const withdrawLiquidityEnabled =
    !!myDepositBalance && myDepositBalance > 0n && depositedTime + lockupPeriod < nowTime;
  const isLocked = depositedTime + lockupPeriod >= nowTime;

  const lockupEndDate = useMemo(
    () => new Date(1000 * (depositedTime + lockupPeriod) || new Date()),
    [depositedTime, lockupPeriod]
  );

  const handleGoToCampaign = () => {
    gaAction({
      action: 'go-to-campaign-add-liquidity',
      data: { page: 'pool-detail', component: 'campaign-tool', link: '/campaign/participate' },
    });

    window.open(`${BASE_URL}/campaign/participate`);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setNow(now);

      const duration = intervalToDuration({ start: now, end: lockupEndDate });
      const { hours, minutes, seconds } = duration;

      setRemainTime({
        hours: (hours || 0).toString().padStart(2, '0'),
        minutes: (minutes || 0).toString().padStart(2, '0'),
        seconds: (seconds || 0).toString().padStart(2, '0'),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [lockupEndDate]);

  const withdrawButtonText = isLocked
    ? `${t('Can withdraw after')} ${remainTime.hours}:${remainTime.minutes}:${remainTime.seconds}`
    : t('Withdraw');

  useEffect(() => {
    if (estimatedClaimFee) return;

    const estimateFeeAsync = debounce(async () => {
      const fee = await estimateClaimFee?.();
      setEstimatedClaimFee(fee);
    }, 1000);

    estimateFeeAsync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEvm, isFpass, walletAddress, rootReward, estimatedClaimFee]);

  useEffect(() => {
    if (claimIsSuccess && claimTxData) userCampaignInfoRefetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claimIsSuccess, claimTxData]);

  const isEmpty =
    !evm.isConnected || (amountFarmedInBPT <= 0 && campaignReward <= 0 && rootReward <= 0);

  const isRootXrpPool = id === POOL_ID?.[NETWORK.THE_ROOT_NETWORK]?.ROOT_XRP;

  if (!started || isEmpty || !isRootXrpPool) return <></>;
  return (
    <Wrapper>
      <TitleWrapper>
        <Title>{t('My Voyage')}</Title>
        <ButtonWrapper>
          {isMD ? (
            <ButtonPrimaryLargeIconTrailing
              text={t('Add liquidity')}
              icon={<IconNext />}
              onClick={handleGoToCampaign}
            />
          ) : (
            <ButtonPrimaryMediumIconTrailing
              text={t('Add liquidity')}
              icon={<IconNext />}
              onClick={handleGoToCampaign}
            />
          )}
        </ButtonWrapper>
      </TitleWrapper>

      <Divider></Divider>

      <ContentWrapper>
        <ContentInnerWrapper>
          <TitleSmall>{t('My liquidity')}</TitleSmall>
          <TokenListVertical
            style={{
              background: 'rgba(255, 255, 255, 0.10)',
              backdropFilter: 'blur(2px)',
            }}
            token="50ROOT-50XRP"
            balance={myDepositBalance}
            value={myDepositValue}
            convertedToken={pool?.compositions?.[1]}
            convertedBalance={myDepositInXrp}
            image={
              <BadgeWrapper style={{ width: 2 * 28 + 12 }}>
                {pool?.compositions?.map((token, idx) => {
                  const { symbol, image } = token;
                  return (
                    <Badge key={symbol + idx} style={{ left: idx * 28 }}>
                      <Image src={image} />
                    </Badge>
                  );
                })}
              </BadgeWrapper>
            }
            button={
              <ButtonPrimaryLarge
                text={withdrawButtonText}
                buttonType="outlined"
                onClick={() => {
                  gaAction({
                    action: 'open-withdraw',
                    data: { page: 'pool-detail', component: 'campaign-tool' },
                  });
                  withdrawPopupOpen();
                }}
                disabled={!withdrawLiquidityEnabled}
              />
            }
          />
        </ContentInnerWrapper>
        <ContentInnerWrapper>
          <TitleSmall>{t('Rewards')}</TitleSmall>
          <TokenInfoWrapper>
            <TokenListVertical
              style={{
                background: 'rgba(255, 255, 255, 0.10)',
                backdropFilter: 'blur(2px)',
              }}
              showValue={false}
              token="veMOAI"
              balance={campaignReward}
              image={<IconTokenMoai width={36} height={36} />}
            />
            <TokenListVertical
              style={{
                background: 'rgba(255, 255, 255, 0.10)',
                backdropFilter: 'blur(2px)',
              }}
              token="ROOT"
              balance={rootReward}
              value={rootReward * rootPrice}
              image={<IconTokenRoot width={36} height={36} />}
              button={
                <ButtonPrimaryLarge
                  text={claimGasError ? t('Not enough gas') : t('Claim')}
                  buttonType="outlined"
                  isLoading={claimLoading}
                  disabled={isError || !estimatedClaimFee || claimGasError || rootReward <= 0}
                  onClick={() => {
                    gaAction({
                      action: 'claim-root',
                      data: {
                        page: 'pool-detail',
                        component: 'campaign-tool',
                        rootReward,
                        userXrpBalance,
                        estimatedClaimFee,
                      },
                    });
                    writeAsync();
                  }}
                />
              }
            />
          </TokenInfoWrapper>
        </ContentInnerWrapper>
      </ContentWrapper>

      {withdrawPopupOpened && withdrawLiquidityEnabled && (
        <WithdrawLiquidityPopup
          pool={pool}
          lpTokenPrice={lpTokenPrice}
          refetchBalance={refetch}
          disableSuccessNavigate
        />
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div(() => [
  tw`relative w-full flex flex-col rounded-12 bg-transparent bg-campaign bg-no-repeat bg-cover `,
  css`
    background-position: 58% 42%;
  `,
  css`
    &::before {
      position: absolute;
      content: '';
      top: 0px;
      left: 0px;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.4);
      border-radius: 12px;
    }
  `,
]);
const TitleWrapper = tw.div`flex justify-between items-center py-16 px-20 z-1
  md:(pt-20 p-24)
`;
const Title = tw.div`font-b-18 text-neutral-100
  md:font-b-20
`;
const ButtonWrapper = tw.div`z-1`;
const Divider = tw.div`w-full h-1 bg-neutral-100/10 z-1`;
const ContentWrapper = tw.div`flex flex-col pt-16 p-20 gap-16 z-1
  md:(pt-20 p-24 gap-20)
`;
const ContentInnerWrapper = tw.div`flex flex-col gap-12`;
const TokenInfoWrapper = tw.div`flex flex-col gap-16 `;
const TitleSmall = tw.div`font-b-14 text-neutral-100
  md:font-b-16
`;
const BadgeWrapper = tw.div`
  flex inline-flex items-center relative h-40
`;

const Badge = tw.div`
  w-40 h-40 absolute flex-center
`;

const Image = tw(LazyLoadImage)`
  w-40 h-40 object-cover flex-center
`;
