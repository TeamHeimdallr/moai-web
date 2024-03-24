import { Fragment, Suspense, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import tw, { styled } from 'twin.macro';
import { formatUnits } from 'viem';

import { useUserLpFarmDeposited } from '~/api/api-contract/_evm/balance/lp-farm-balance';
import { useUnfarm } from '~/api/api-contract/_evm/lp-farm/unfarm';
import { useUserAllTokenBalances } from '~/api/api-contract/balance/user-all-token-balances';
import { useUserPoolTokenBalances } from '~/api/api-contract/balance/user-pool-token-balances';
import { useGetTokenQuery } from '~/api/api-server/token/get-token';

import { COLOR } from '~/assets/colors';
import { IconCancel, IconCheck, IconLink, IconTime, IconTokenRoot } from '~/assets/icons';

import { LP_FARM_ADDRESS_WITH_POOL_ID, SCANNER_URL, THOUSAND } from '~/constants';

import { ButtonPrimaryLarge } from '~/components/buttons';
import { List } from '~/components/lists';
import { Popup } from '~/components/popup';
import { ListSkeleton } from '~/components/skeleton/list-skeleton';
import { SkeletonBase } from '~/components/skeleton/skeleton-base';
import { TokenList } from '~/components/token-list';

import { useGAAction } from '~/hooks/analaystics/ga-action';
import { useGAInView } from '~/hooks/analaystics/ga-in-view';
import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { DATE_FORMATTER, formatNumber, getNetworkFull } from '~/utils';
import { useUnfarmNetworkFeeErrorStore } from '~/states/contexts/network-fee-error/network-fee-error';
import { NETWORK, POPUP_ID } from '~/types';

interface Props {
  poolId: string;
  refetchBalance?: () => void;
}

export const UnfarmPopup = ({ poolId, refetchBalance }: Props) => {
  return (
    <Suspense fallback={<_UnfarmPopupSkeleton />}>
      <_UnfarmPopup poolId={poolId} refetchBalance={refetchBalance} />
    </Suspense>
  );
};

const _UnfarmPopup = ({ poolId, refetchBalance }: Props) => {
  const { ref } = useGAInView({ name: 'lp-unfarm-popup' });
  const { gaAction } = useGAAction();
  const queryClient = useQueryClient();

  const navigate = useNavigate();
  const { isEvm, isFpass } = useNetwork();

  const { t } = useTranslation();
  const { network: networkParam } = useParams();
  const { selectedNetwork } = useNetwork();

  const [estimatedUnfarmFee, setEstimatedUnfarmFee] = useState<number | undefined>();

  const currentNetwork = getNetworkFull(networkParam) ?? selectedNetwork;

  const { error: unfarmGasError, setError: setUnfarmGasError } = useUnfarmNetworkFeeErrorStore();

  const { userAllTokenBalances } = useUserAllTokenBalances();
  const xrp = userAllTokenBalances?.find(t => t.symbol === 'XRP');
  const xrpBalance = xrp?.balance || 0;

  const { close } = usePopup(POPUP_ID.LP_UNFARM);

  const isRoot = selectedNetwork === NETWORK.THE_ROOT_NETWORK;

  const farmAddress = LP_FARM_ADDRESS_WITH_POOL_ID?.[NETWORK.THE_ROOT_NETWORK]?.[poolId ?? ''];
  const isLpFarmExisted = isRoot && farmAddress && farmAddress !== '0x0';

  const { depositedRaw, deposited, pending, pendingRaw } = useUserLpFarmDeposited({
    farmAddress,
    enabled: isLpFarmExisted,
  });

  const rootAddress = '0xcCcCCccC00000001000000000000000000000000';
  const { data: tokenData } = useGetTokenQuery(
    { queries: { networkAbbr: networkParam, address: rootAddress } },
    { enabled: !!rootAddress && !!networkParam }
  );
  const { token: rootToken } = tokenData || {};

  const pendingValue = pending * (rootToken?.price || 0);

  const { lpTokenPrice, lpToken, lpTokenTotalSupply } = useUserPoolTokenBalances({
    network: 'trn',
    id: poolId,
  });

  const userShare = formatNumber((100 * deposited) / lpTokenTotalSupply, 3);
  const unfarmValue = deposited * lpTokenPrice;
  const {
    isLoading: unFarmLoading,
    isSuccess: unFarmSuccess,
    txData,
    writeAsync,
    blockTimestamp,
    estimateFee: estimateUnfarmFee,
  } = useUnfarm({
    poolId,
    unfarmAmount: depositedRaw,
    enabled: isLpFarmExisted,
  });

  const txDate = new Date(blockTimestamp || 0);
  const isIdle = !txData;
  const isSuccess = unFarmSuccess && !!txData;
  const isLoading = unFarmLoading;

  const buttonText = useMemo(() => {
    if (!isIdle) {
      if (isSuccess) return t('Return to pool page');
      return t('Try again');
    }

    return t('Unfarm');
  }, [isIdle, isSuccess, t]);

  const handleButtonClick = async () => {
    if (isLoading) return;
    if (!isIdle) {
      if (isSuccess) {
        gaAction({
          action: 'go-to-pool-page',
          data: { component: 'lp-unfarm-popup', link: `pools/${networkParam}/${poolId}` },
        });

        close();
        navigate(`/pools/${networkParam}/${poolId}`);
        return;
      }
      close();
      return;
    }

    gaAction({
      action: 'lp-unfarm',
      data: {
        isFpass,
        component: 'lp-unfarm-popup',
        poolId,
        depositedRaw,
        xrpBalance,
        estimatedUnfarmFee,
      },
    });
    return await writeAsync?.();
  };

  const handleLink = () => {
    const txHash = isFpass ? txData?.extrinsicId : isEvm ? txData?.transactionHash : txData?.hash;
    const url = `${SCANNER_URL[currentNetwork || NETWORK.THE_ROOT_NETWORK]}/${
      isFpass ? 'extrinsics' : isEvm ? 'tx' : 'transactions'
    }/${txHash}`;

    gaAction({
      action: 'go-to-transaction',
      data: { component: 'lp-unfarm-popup', txHash: txHash, link: url },
    });

    window.open(url);
  };

  useEffect(() => {
    return () => {
      setUnfarmGasError(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isIdle) {
      queryClient.invalidateQueries(['GET', 'POOL']);
      refetchBalance?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isIdle, queryClient]);

  useEffect(() => {
    if (!estimateUnfarmFee || !isLpFarmExisted) return;

    const estimateUnfarmFeeAsync = async () => {
      const fee = await estimateUnfarmFee?.();
      setEstimatedUnfarmFee(fee ?? 3.0);
    };
    estimateUnfarmFeeAsync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLpFarmExisted]);

  const estimatedFee = estimatedUnfarmFee || '';

  const gasError = xrpBalance <= Number(estimatedFee || 3.0) || unfarmGasError;

  return (
    <Popup
      id={POPUP_ID.LP_UNFARM}
      title={isIdle ? t('Unfarm LP Tokens') : ''}
      button={
        <ButtonWrapper onClick={() => handleButtonClick()}>
          <ButtonPrimaryLarge
            text={buttonText}
            isLoading={isLoading}
            buttonType={isIdle ? 'filled' : 'outlined'}
            disabled={(isIdle && gasError) || !estimatedFee}
          />
        </ButtonWrapper>
      }
    >
      <Wrapper style={{ gap: isIdle ? 24 : 40 }} ref={ref}>
        {!isIdle && isSuccess && (
          <SuccessWrapper>
            <IconWrapper>
              <IconCheck width={40} height={40} />
            </IconWrapper>
            <SuccessTitle>{t('Unfarm confirmed!')}</SuccessTitle>
            <SuccessSubTitle>{t('unfarm-success-message')}</SuccessSubTitle>
          </SuccessWrapper>
        )}
        {!isIdle && !isSuccess && (
          <FailedWrapper style={{ paddingBottom: '24px' }}>
            <FailedIconWrapper>
              <IconCancel width={40} height={40} />
            </FailedIconWrapper>
            <SuccessTitle>{t('Unfarm failed')}</SuccessTitle>
            <SuccessSubTitle>{t('unfarm-fail-message')}</SuccessSubTitle>
          </FailedWrapper>
        )}
        {isIdle && (
          <List title={t(`You're receiving`)}>
            <TokenList
              type="large"
              title={`${formatNumber(
                Number(formatUnits(depositedRaw || 0n, 18)),
                4,
                'floor',
                THOUSAND,
                0
              )} ${lpToken?.symbol}`}
              description={`$${formatNumber(unfarmValue)}`}
              image={<Jazzicon diameter={36} seed={jsNumberForAddress(lpToken?.address || '')} />}
              leftAlign
            />
            <Divider />
            <TokenList
              type="large"
              title={`${formatNumber(
                Number(formatUnits(pendingRaw || 0n, 6)),
                4,
                'floor',
                THOUSAND,
                0
              )} ROOT`}
              description={`$${formatNumber(pendingValue)}`}
              image={<IconTokenRoot width={36} height={36} />}
              leftAlign
            />
          </List>
        )}
        {!isIdle && isSuccess && (
          <List title={t(`You're received`)}>
            <TokenList
              type="large"
              title={`${formatNumber(
                Number(formatUnits(depositedRaw || 0n, 18)),
                4,
                'floor',
                THOUSAND,
                0
              )} ${lpToken?.symbol}`}
              description={`$${formatNumber(unfarmValue)}`}
              image={<Jazzicon diameter={36} seed={jsNumberForAddress(lpToken?.address || '')} />}
              leftAlign
            />
            <Divider />
            <TokenList
              type="large"
              title={`${formatNumber(
                Number(formatUnits(pendingRaw || 0n, 6)),
                4,
                'floor',
                THOUSAND,
                0
              )} ROOT`}
              description={`$${formatNumber(pendingValue)}`}
              image={<IconTokenRoot width={36} height={36} />}
              leftAlign
            />
          </List>
        )}
        {!isIdle && isSuccess && (
          <Scanner onClick={() => handleLink()}>
            <IconTime width={20} height={20} fill={COLOR.NEUTRAL[40]} />
            <ScannerText> {format(new Date(txDate), DATE_FORMATTER.FULL)}</ScannerText>
            <IconLink width={20} height={20} fill={COLOR.NEUTRAL[40]} />
          </Scanner>
        )}
        {isIdle && (
          <>
            <List title={t(`Summary`)}>
              <Summary>
                <SummaryTextTitle>{t('Total value to unfarm')}</SummaryTextTitle>
                <SummaryText>{`$${formatNumber(unfarmValue + pendingValue)}`}</SummaryText>
              </Summary>
              <Summary>
                <SummaryTextTitle>{t('Your total share')}</SummaryTextTitle>
                <SummaryText>{userShare}%</SummaryText>
              </Summary>
              <Divider />
              <GasFeeWrapper>
                <GasFeeInnerWrapper>
                  <GasFeeTitle>{t(`Gas fee`)}</GasFeeTitle>
                  <GasFeeTitleValue>
                    {estimatedFee ? `~${formatNumber(estimatedFee)} XRP` : t('calculating...')}
                  </GasFeeTitleValue>
                </GasFeeInnerWrapper>
                <GasFeeInnerWrapper>
                  <GasFeeCaption error={gasError}>
                    {gasError
                      ? t(`Not enough balance to pay for Gas Fee.`)
                      : t(`May change when network is busy`)}
                  </GasFeeCaption>
                </GasFeeInnerWrapper>
              </GasFeeWrapper>
            </List>
          </>
        )}
      </Wrapper>
    </Popup>
  );
};

const _UnfarmPopupSkeleton = () => {
  const { t } = useTranslation();
  return (
    <Popup id={POPUP_ID.LP_UNFARM} title={t('Unfarm LP Tokens')}>
      <Wrapper>
        <ListSkeleton height={191} title={t("You're receiving")} />
        <ListSkeleton height={195} title={t('Summary')} />
        <SkeletonBase height={48} borderRadius={12} />
      </Wrapper>
    </Popup>
  );
};

const Divider = tw.div`
  w-full h-1 flex-shrink-0 bg-neutral-20
`;

const Wrapper = tw.div`
  flex flex-col gap-24 px-24 py-0
`;

const SuccessTitle = tw.div`
  text-neutral-100 font-b-24
`;

const SuccessSubTitle = tw.div`
  text-neutral-80 font-r-16
`;

const SuccessWrapper = tw.div`
  flex-center flex-col gap-12
`;

const FailedWrapper = tw.div`
  flex-center flex-col gap-12
`;

const FailedIconWrapper = tw.div`
  flex-center w-48 h-48 rounded-full bg-red-50
`;

const IconWrapper = tw.div`
  flex-center w-48 h-48 rounded-full bg-green-50
`;

const Summary = tw.div`
  flex justify-between bg-neutral-15 gap-16 px-16 py-8
`;

const SummaryTextTitle = tw.div`
  text-neutral-100 font-r-16
`;

const SummaryText = tw.div`
  text-neutral-100 font-m-16
`;

const ButtonWrapper = tw.div`
  mt-16 w-full
`;

const Scanner = tw.div`
  flex items-start gap-4 clickable
`;

const ScannerText = tw.div`
  font-r-12 text-neutral-60
`;

const GasFeeWrapper = tw.div`
  px-16 py-8 flex-col
`;

const GasFeeInnerWrapper = tw.div`
  flex gap-4
`;

const GasFeeTitle = tw.div`
  font-r-14 text-neutral-100 flex-1
`;
const GasFeeTitleValue = tw.div`
  font-m-14 text-neutral-100
`;

interface GasFeeCaptionProps {
  error?: boolean;
}
const GasFeeCaption = styled.div<GasFeeCaptionProps>(({ error }) => [
  tw`
    font-r-12 text-neutral-60 flex-1
  `,
  error && tw`text-red-50`,
]);
