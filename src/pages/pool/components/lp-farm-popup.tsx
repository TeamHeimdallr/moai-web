import { Fragment, Suspense, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import tw, { styled } from 'twin.macro';
import { formatUnits } from 'viem';

import { useUserLpFarmDeposited } from '~/api/api-contract/_evm/balance/lp-farm-balance';
import { useFarm } from '~/api/api-contract/_evm/lp-farm/farm';
import { useUserAllTokenBalances } from '~/api/api-contract/balance/user-all-token-balances';
import { useUserPoolTokenBalances } from '~/api/api-contract/balance/user-pool-token-balances';
import { useApprove } from '~/api/api-contract/token/approve';
import { useGetTokenQuery } from '~/api/api-server/token/get-token';

import { COLOR } from '~/assets/colors';
import { IconCancel, IconCheck, IconLink, IconTime, IconTokenRoot } from '~/assets/icons';

import { LP_FARM_ADDRESS_WITH_POOL_ID, SCANNER_URL, THOUSAND } from '~/constants';

import { ButtonPrimaryLarge } from '~/components/buttons';
import { List } from '~/components/lists';
import { LoadingStep } from '~/components/loadings';
import { Popup } from '~/components/popup';
import { ListSkeleton } from '~/components/skeleton/list-skeleton';
import { SkeletonBase } from '~/components/skeleton/skeleton-base';
import { TokenList } from '~/components/token-list';

import { useGAAction } from '~/hooks/analaystics/ga-action';
import { useGAInView } from '~/hooks/analaystics/ga-in-view';
import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { DATE_FORMATTER, formatNumber, getNetworkFull } from '~/utils';
import {
  useApproveNetworkFeeErrorStore,
  useFarmNetworkFeeErrorStore,
} from '~/states/contexts/network-fee-error/network-fee-error';
import { NETWORK, POPUP_ID } from '~/types';

interface Props {
  poolId: string;
  refetchBalance?: () => void;
}

export const FarmPopup = ({ poolId, refetchBalance }: Props) => {
  return (
    <Suspense fallback={<_FarmPopupSkeleton />}>
      <_FarmPopup poolId={poolId} refetchBalance={refetchBalance} />
    </Suspense>
  );
};

const _FarmPopup = ({ poolId, refetchBalance }: Props) => {
  const { ref } = useGAInView({ name: 'lp-farm-popup' });
  const { gaAction } = useGAAction();
  const queryClient = useQueryClient();

  const navigate = useNavigate();
  const { isEvm, isFpass } = useNetwork();

  const { t } = useTranslation();
  const { network: networkParam } = useParams();
  const { selectedNetwork } = useNetwork();

  const [estimatedFarmFee, setEstimatedFarmFee] = useState<number | undefined>();
  const [estimatedApproveFee, setEstimatedApproveFee] = useState<number | undefined>();

  const currentNetwork = getNetworkFull(networkParam) ?? selectedNetwork;

  const { error: farmGasError, setError: setFarmGasError } = useFarmNetworkFeeErrorStore();
  const { error: approveGasError, setError: setApproveGasError } = useApproveNetworkFeeErrorStore();

  const { userAllTokenBalances } = useUserAllTokenBalances();
  const xrp = userAllTokenBalances?.find(t => t.symbol === 'XRP');
  const xrpBalance = xrp?.balance || 0;

  const { close } = usePopup(POPUP_ID.LP_FARM);

  const isRoot = selectedNetwork === NETWORK.THE_ROOT_NETWORK;

  const farmAddress = LP_FARM_ADDRESS_WITH_POOL_ID?.[NETWORK.THE_ROOT_NETWORK]?.[poolId ?? ''];
  const isLpFarmExisted = isRoot && farmAddress && farmAddress !== '0x0';

  const { depositedRaw, pending, pendingRaw, lpTokenAddress } = useUserLpFarmDeposited({
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

  const { lpTokenPrice, lpToken, lpTokenTotalSupply, userLpTokenBalance, userLpTokenBalanceRaw } =
    useUserPoolTokenBalances({
      network: 'trn',
      id: poolId,
    });

  const userShare = formatNumber((100 * userLpTokenBalance) / lpTokenTotalSupply, 3);
  const farmValue = userLpTokenBalance * lpTokenPrice;

  const {
    allow,
    allowance,
    isLoading: allowLoading,
    isSuccess: allowSuccess,
    refetch: refetchAllowance,
    estimateFee: estimateApproveFee,
  } = useApprove({
    amount: userLpTokenBalanceRaw,
    address: lpTokenAddress || '',
    issuer: '',
    symbol: '',
    spender: farmAddress || '',
    enabled: isLpFarmExisted,
  });

  const {
    isLoading: farmLoading,
    isSuccess: farmSuccess,
    txData,
    writeAsync,
    blockTimestamp,
    estimateFee: estimateFarmFee,
  } = useFarm({
    poolId,
    farmAmount: userLpTokenBalanceRaw,
    enabled: isLpFarmExisted && !!allowance,
  });

  const txDate = new Date(blockTimestamp || 0);
  const isIdle = !txData;
  const isSuccess = farmSuccess && !!txData;
  const isLoading = farmLoading || allowLoading;

  const step = useMemo(() => {
    if (isSuccess) return 2;
    if (allowance) return 2;
    return 1;
  }, [allowance, isSuccess]);

  const stepLoading = useMemo(() => {
    if (step === 1) return allowLoading;
    if (step === 2) return farmLoading;

    return false;
  }, [allowLoading, step, farmLoading]);

  const buttonText = useMemo(() => {
    if (!isIdle) {
      if (isSuccess) return t('Return to pool page');
      return t('Try again');
    }

    if (!allowance) {
      return t('approve-lp-farm-message');
    }

    return t('Farm');
  }, [allowance, isIdle, isSuccess, t]);

  const handleButtonClick = async () => {
    if (isLoading) return;
    if (!isIdle) {
      if (isSuccess) {
        gaAction({
          action: 'go-to-pool-page',
          data: { component: 'lp-farm-popup', link: `pools/${networkParam}/${poolId}` },
        });

        close();
        navigate(`/pools/${networkParam}/${poolId}`);
        return;
      }
      close();
      return;
    }

    if (!allowance) {
      gaAction({
        action: 'approve-token',
        data: {
          isFpass,
          component: 'lp-farm-popup',
          amount: userLpTokenBalanceRaw,
          address: lpTokenAddress || '',
          spender: farmAddress || '',
          xrpBalance,
          estimatedApproveFee,
        },
      });
      await allow();
    } else {
      gaAction({
        action: 'lp-farm',
        data: {
          isFpass,
          component: 'lp-farm-popup',
          poolId,
          depositedRaw,
          xrpBalance,
          estimatedFarmFee,
        },
      });
      return await writeAsync?.();
    }
  };

  const handleLink = () => {
    const txHash = isFpass ? txData?.extrinsicId : isEvm ? txData?.transactionHash : txData?.hash;
    const url = `${SCANNER_URL[currentNetwork || NETWORK.THE_ROOT_NETWORK]}/${
      isFpass ? 'extrinsics' : isEvm ? 'tx' : 'transactions'
    }/${txHash}`;

    gaAction({
      action: 'go-to-transaction',
      data: { component: 'lp-farm-popup', txHash: txHash, link: url },
    });

    window.open(url);
  };

  useEffect(() => {
    return () => {
      setFarmGasError(false);
      setApproveGasError(false);
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
    if (allowSuccess) refetchAllowance();
  }, [allowSuccess, refetchAllowance]);

  useEffect(() => {
    if (!estimateFarmFee || !isLpFarmExisted || !allowance) return;

    const estimateFarmFeeAsync = async () => {
      const fee = await estimateFarmFee?.();
      setEstimatedFarmFee(fee ?? 3.0);
    };
    estimateFarmFeeAsync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLpFarmExisted, allowance]);

  useEffect(() => {
    const estimateApproveFeeAsync = async () => {
      const fee = await estimateApproveFee?.();
      setEstimatedApproveFee(fee ?? 1.5);
    };

    if (step === 1 && isLpFarmExisted) {
      estimateApproveFeeAsync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, isLpFarmExisted]);

  const estimatedFee = step === 1 ? estimatedApproveFee || '' : estimatedFarmFee || '';

  const gasError = xrpBalance <= Number(estimatedFee || 3.0) || farmGasError || approveGasError;

  return (
    <Popup
      id={POPUP_ID.LP_FARM}
      title={isIdle ? t('Farm LP Tokens') : ''}
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
            <SuccessTitle>{t('Farm confirmed!')}</SuccessTitle>
            <SuccessSubTitle>{t('farm-success-message')}</SuccessSubTitle>
          </SuccessWrapper>
        )}
        {!isIdle && !isSuccess && (
          <FailedWrapper style={{ paddingBottom: '24px' }}>
            <FailedIconWrapper>
              <IconCancel width={40} height={40} />
            </FailedIconWrapper>
            <SuccessTitle>{t('farm failed')}</SuccessTitle>
            <SuccessSubTitle>{t('farm-fail-message')}</SuccessSubTitle>
          </FailedWrapper>
        )}
        {isIdle && (
          <List title={t(`You're providing`)}>
            <TokenList
              type="large"
              title={`${formatNumber(
                Number(formatUnits(userLpTokenBalanceRaw || 0n, 18)),
                4,
                'floor',
                THOUSAND,
                0
              )} ${lpToken?.symbol}`}
              description={`$${formatNumber(farmValue)}`}
              image={<Jazzicon diameter={36} seed={jsNumberForAddress(lpToken?.address || '')} />}
              leftAlign
            />
          </List>
        )}
        {!isIdle && isSuccess && (
          <>
            <List title={t(`You're providing`)}>
              <TokenList
                type="large"
                title={`${formatNumber(
                  Number(formatUnits(userLpTokenBalanceRaw || 0n, 18)), // TODO: this is refetched value
                  4,
                  'floor',
                  THOUSAND,
                  0
                )} ${lpToken?.symbol}`}
                description={`$${formatNumber(farmValue)}`}
                image={<Jazzicon diameter={36} seed={jsNumberForAddress(lpToken?.address || '')} />}
                leftAlign
              />
            </List>
            {pendingRaw && pendingRaw > 0 && (
              <List title={t(`You're received`)}>
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
            )}{' '}
          </>
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
                <SummaryTextTitle>{t('Total value to farm')}</SummaryTextTitle>
                <SummaryText>{`$${formatNumber(farmValue)}`}</SummaryText>
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
            <LoadingStep totalSteps={2} step={step} isLoading={stepLoading} isDone={isSuccess} />
          </>
        )}
      </Wrapper>
    </Popup>
  );
};

const _FarmPopupSkeleton = () => {
  const { t } = useTranslation();
  return (
    <Popup id={POPUP_ID.LP_FARM} title={t('Farm LP Tokens')}>
      <Wrapper>
        <ListSkeleton height={118} title={t("You're providing")} />
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
