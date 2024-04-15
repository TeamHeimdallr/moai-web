import { Suspense, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { strip } from 'number-precision';
import tw, { css, styled } from 'twin.macro';
import { formatUnits, parseUnits } from 'viem';

import { useAmmInfo } from '~/api/api-contract/_xrpl/amm/amm-info';
import { useUserAllTokenBalances } from '~/api/api-contract/balance/user-all-token-balances';
import { useSwap } from '~/api/api-contract/swap/swap';
import { useApprove } from '~/api/api-contract/token/approve';

import { COLOR } from '~/assets/colors';
import { IconArrowDown, IconCancel, IconCheck, IconLink, IconTime } from '~/assets/icons';

import { ASSET_URL, MILLION, SCANNER_URL, THOUSAND } from '~/constants';

import { ButtonChipSmall, ButtonPrimaryLarge } from '~/components/buttons';
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
import {
  DATE_FORMATTER,
  formatAmountToNumber,
  formatAmountToNumberFromToken,
  formatNumber,
  tokenToAmmAsset,
} from '~/utils';
import {
  useApproveNetworkFeeErrorStore,
  useSwapNetworkFeeErrorStore,
} from '~/states/contexts/network-fee-error/network-fee-error';
import { useSlippageStore } from '~/states/data';
import { NETWORK } from '~/types';
import { POPUP_ID } from '~/types/components';

import { useSwapStore } from '../states';

interface Props {
  refetchBalance?: () => void;
}

export const SwapPopupXrpl = ({ refetchBalance }: Props) => {
  return (
    <Suspense fallback={<_SwapPopupSkeleton />}>
      <_SwapPopup refetchBalance={refetchBalance} />
    </Suspense>
  );
};

const _SwapPopup = ({ refetchBalance }: Props) => {
  const { ref } = useGAInView({ name: 'swap-popup' });
  const { gaAction } = useGAAction();

  const { error: swapGasError, setError: setSwapGasError } = useSwapNetworkFeeErrorStore();
  const { error: approveGasError, setError: setApproveGasError } = useApproveNetworkFeeErrorStore();

  const { userAllTokenBalances } = useUserAllTokenBalances();

  const queryClient = useQueryClient();

  const { t } = useTranslation();
  const { isXrp } = useNetwork();

  const xrpBalance = userAllTokenBalances?.find(t => t.symbol === 'XRP')?.balance || 0;

  const { close } = usePopup(POPUP_ID.SWAP);
  const { slippage: slippageRaw } = useSlippageStore();

  const [estimatedSwapFee, setEstimatedSwapFee] = useState<number | undefined>();
  const [estimatedToTokenApproveFee, setEstimatedToTokenApproveFee] = useState<
    number | undefined
  >();

  const slippage = Number(slippageRaw || 0);

  const { fromToken, toToken, fromInput, selectedDetailInfo, selectDetailInfo } = useSwapStore();
  const numFromInput = Number(fromInput) || 0;

  const { data: ammInfoData } = useAmmInfo({
    asset: tokenToAmmAsset(fromToken),
    asset2: tokenToAmmAsset(toToken),
    enabled: !!fromToken && !!toToken,
  });
  const { amm } = ammInfoData || {};
  const { trading_fee: trandingFee } = amm || {};

  const fromTokenReserve = formatAmountToNumberFromToken(fromToken, amm);
  const toTokenReserve = formatAmountToNumberFromToken(toToken, amm);
  const fee = (trandingFee || 0) / 10 ** 5;

  const toInput =
    fromToken && toToken
      ? fromInput
        ? Number(
            strip(
              toTokenReserve -
                toTokenReserve *
                  (fromTokenReserve / (fromTokenReserve + Number(fromInput) * (1 - fee)))
            ).toFixed(6)
          )
        : undefined
      : undefined;

  const swapRatio =
    fromInput && toInput
      ? (toInput || 0) / (Number(fromInput || 0) === 0 ? 0.0001 : Number(fromInput || 0))
      : toTokenReserve - toTokenReserve * (fromTokenReserve / (fromTokenReserve + (1 - fee)));

  const approveEnabled = toToken && !!toInput && toInput > 0;
  const {
    allow: allowToToken,
    allowance: allowanceToToken,
    isLoading: allowToTokenLoading,
    isSuccess: allowToTokenSuccess,
    refetch: refetchToTokenAllowance,
    estimateFee: estimateToTokenApproveFee,
  } = useApprove({
    amount: parseUnits(`${toInput || 0}`, 6),
    symbol: toToken?.symbol || '',
    address: toToken?.address || '',
    issuer: toToken?.address || '',
    spender: '',
    currency: toToken?.currency || '',
    enabled: approveEnabled,
  });

  const validAmount = numFromInput > 0 || (!!toInput && toInput > 0);
  const validAllowance = allowanceToToken;
  const swapEnabled = validAllowance && validAmount;

  const {
    txData,
    blockTimestamp,
    isLoading: swapLoading,
    isSuccess: swapSuccess,
    swap,
    estimateFee: estimateSwapFee,
  } = useSwap({
    id: '',
    fromToken: fromToken,
    fromInput: numFromInput,
    toToken: toToken,
    toInput: toInput,
    enabled: swapEnabled,
  });

  const txDate = new Date(blockTimestamp || 0);
  const isIdle = !txData;
  const isSuccess = swapSuccess && !!txData;
  const isLoading = swapLoading || allowToTokenLoading;

  const effectivePrice =
    fromToken && toToken && swapRatio
      ? `1 ${fromToken.symbol} = ${formatNumber(swapRatio, 6, 'floor', MILLION, 0)} ${
          toToken.symbol
        }`
      : '';

  const fromTokenPrice = fromToken?.price || 0;
  const fromTokenValue = numFromInput * fromTokenPrice;
  const toTokenPrice = toToken?.price || 0;
  const toTokenValue = (toInput || 0) * toTokenPrice;

  const fromTokenActualAmount = Number(formatUnits(txData?.swapAmountFrom ?? 0n, 6));
  const toTokenActualAmount = Number(
    formatAmountToNumber(txData?.meta?.delivered_amount ?? '0', 'dropToXrp')
  );

  const toTokenFinalValue = toTokenActualAmount * toTokenPrice;

  const currentUnit = selectedDetailInfo === 'TOKEN' ? toToken?.symbol || '' : 'USD';

  const slippageText = `${Number(slippage.toFixed(2))}%`;
  const totalAfterSlippage = (1 - slippage / 100) * (toInput || 0);
  const totalAfterSlippageUsd = totalAfterSlippage * toTokenPrice;

  const step = useMemo(() => {
    if (isSuccess) return 2;
    if (allowanceToToken) return 2;

    return 1;
  }, [allowanceToToken, isSuccess]);

  const stepLoading = useMemo(() => {
    if (step === 1) return allowToTokenLoading;
    if (step === 2) return swapLoading;

    return false;
  }, [allowToTokenLoading, step, swapLoading]);

  const buttonText = useMemo(() => {
    if (!isIdle) {
      if (isSuccess) return t('Close');
      return t('Try again');
    }

    if (!allowanceToToken) return t('approve-swap-message', { token: toToken?.symbol });
    return t('Confirm swap');
  }, [allowanceToToken, isSuccess, t, isIdle, toToken?.symbol]);

  const handleButtonClick = async () => {
    if (isLoading) return;
    if (!isIdle) {
      gaAction({
        action: 'close-swap-popup',
        data: { component: 'swap-popup' },
      });
      close();
      return;
    }

    if (allowanceToToken) {
      await swap?.();
      gaAction({
        action: 'swap',
        data: {
          isXrp,
          component: 'swap-popup',
          fromToken: fromToken?.symbol,
          fromTokenValue,
          toToken: toToken?.symbol,
          toTokenValue,
          xrpBalance,
          estimatedSwapFee,
        },
      });
      return;
    } else {
      gaAction({
        action: 'approve-token',
        data: {
          isXrp,
          symbol: toToken?.symbol,
          component: 'swap-popup',
          fromToken: fromToken?.symbol,
          fromTokenValue,
          toToken: toToken?.symbol,
          toTokenValue,
          xrpBalance,
          estimatedToTokenApproveFee,
        },
      });
      await allowToToken();
    }
  };

  const handleLink = () => {
    const txHash = txData?.hash;
    const url = `${SCANNER_URL[NETWORK.XRPL]}/transactions/${txHash}`;

    gaAction({
      action: 'go-to-transaction',
      data: { component: 'swap-popup', txHash: txHash, link: url },
    });

    window.open(url);
  };

  useEffect(() => {
    if (allowToTokenSuccess) refetchToTokenAllowance();
  }, [allowToTokenSuccess, refetchToTokenAllowance]);

  useEffect(() => {
    if (!isIdle) {
      queryClient.invalidateQueries(['GET', 'POOL']);
      queryClient.invalidateQueries(['GET', 'XRPL']);
      refetchBalance?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isIdle, queryClient]);

  useEffect(() => {
    return () => {
      setSwapGasError(false);
      setApproveGasError(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!estimateSwapFee || !swapEnabled || step !== 2) return;

    const estimateSwapFeeAsync = async () => {
      const fee = await estimateSwapFee?.();
      setEstimatedSwapFee(fee ?? 3.9262);
    };
    estimateSwapFeeAsync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swapEnabled, step]);

  useEffect(() => {
    if (step !== 1) return;
    if (!approveEnabled) return;

    const estimateApproveFeeAsync = async () => {
      const fee = await estimateToTokenApproveFee?.();
      setEstimatedToTokenApproveFee(fee ?? 1.5);
    };
    estimateApproveFeeAsync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isXrp, approveEnabled, step]);

  const estimatedFee = 0.0001;
  const validMaxXrpAmount =
    fromToken?.symbol === 'XRP' ? numFromInput + Number(estimatedFee) < xrpBalance : true;

  const gasError =
    xrpBalance <= Number(estimatedFee) || swapGasError || approveGasError || !validMaxXrpAmount;

  return (
    <Popup
      id={POPUP_ID.SWAP}
      title={isIdle ? t('Swap preview') : ''}
      button={
        <ButtonWrapper onClick={() => handleButtonClick()}>
          <ButtonPrimaryLarge
            text={buttonText}
            isLoading={isLoading}
            buttonType={isIdle ? 'filled' : 'outlined'}
            disabled={(isIdle && (!fromToken || !toToken || gasError)) || !estimatedFee}
          />
        </ButtonWrapper>
      }
    >
      <Wrapper style={{ gap: isIdle ? 24 : 40 }} ref={ref}>
        {!isIdle && isSuccess && (
          <>
            <SuccessWrapper>
              <SuccessIconWrapper>
                <IconCheck width={40} height={40} />
              </SuccessIconWrapper>
              <SuccessTitle>{t('Swap confirmed!')}</SuccessTitle>
              {!!fromTokenActualAmount && !!toTokenActualAmount && (
                <SuccessSubTitle>
                  {t('swap-success-message', {
                    fromValue: fromTokenActualAmount,
                    fromToken: fromToken?.symbol,
                    toValue: formatNumber(toTokenActualAmount, 6, 'floor', MILLION, 0),
                    toToken: toToken?.symbol,
                  })}
                </SuccessSubTitle>
              )}
            </SuccessWrapper>

            <List title={t(`Total swap`)}>
              <TokenList
                title={`${formatNumber(
                  toTokenActualAmount,
                  6,
                  'floor',
                  MILLION,
                  0
                )} ${toToken?.symbol}`}
                description={toTokenFinalValue ? `$${formatNumber(toTokenFinalValue)}` : '-'}
                image={toToken?.image || `${ASSET_URL}/tokens/token-unknown.png`}
                type="large"
                leftAlign
              />
            </List>
          </>
        )}
        {!isIdle && !isSuccess && (
          <FailedWrapper style={{ paddingBottom: '16px' }}>
            <FailedIconWrapper>
              <IconCancel width={40} height={40} />
            </FailedIconWrapper>
            <SuccessTitle>{t('Swap failed')}</SuccessTitle>
            <SuccessSubTitle>{t('swap-fail-message')}</SuccessSubTitle>
          </FailedWrapper>
        )}
        {isIdle && (
          <>
            <ListWrapper>
              <List title={`${t('Effective price')}: ${effectivePrice}`}>
                <TokenList
                  title={`${formatNumber(fromInput, 6, 'floor', MILLION, 0)} ${fromToken?.symbol}`}
                  description={fromTokenPrice ? `$${formatNumber(fromTokenValue)}` : '-'}
                  image={fromToken?.image || `${ASSET_URL}/tokens/token-unknown.png`}
                  type="large"
                  leftAlign
                />
                <Divider />
                <IconWrapper>
                  <ArrowDownWrapper>
                    <IconArrowDown width={20} height={20} fill={COLOR.PRIMARY[50]} />
                  </ArrowDownWrapper>
                </IconWrapper>
                <TokenList
                  title={`${formatNumber(toInput, 6, 'floor', MILLION, 0)} ${toToken?.symbol}`}
                  description={toTokenPrice ? `$${formatNumber(toTokenValue)}` : '-'}
                  image={toToken?.image || `${ASSET_URL}/tokens/token-unknown.png`}
                  type="large"
                  leftAlign
                />
              </List>
            </ListWrapper>

            <DetailWrapper>
              <DetailTitleWrapper>
                {t('swap-detail', { token: fromToken?.symbol })}
                <DetailButtonWrapper>
                  <ButtonChipSmall
                    text="TOKEN"
                    selected={selectedDetailInfo === 'TOKEN'}
                    onClick={() => selectDetailInfo('TOKEN')}
                  />
                  <ButtonChipSmall
                    text="USD"
                    selected={selectedDetailInfo === 'USD'}
                    onClick={() => selectDetailInfo('USD')}
                  />
                </DetailButtonWrapper>
              </DetailTitleWrapper>
              <DetailInfoWrapper>
                <DetailInfoInnerWrapper>
                  <DetailInfoTextWrapper>
                    <DetailInfoText>{t('Total expected after fees')}</DetailInfoText>
                    <DetailInfoText>{`${formatNumber(
                      selectedDetailInfo === 'TOKEN' ? toInput : toTokenValue,
                      selectedDetailInfo === 'TOKEN' ? 6 : 2,
                      'floor',
                      MILLION,
                      0
                    )} ${currentUnit}`}</DetailInfoText>
                  </DetailInfoTextWrapper>
                  <DetailInfoTextWrapper>
                    <DetailInfoSubtext>
                      {t('least-user-get-message', { slippage: slippageText })}
                    </DetailInfoSubtext>
                    <DetailInfoSubtext>{`${formatNumber(
                      selectedDetailInfo === 'TOKEN' ? totalAfterSlippage : totalAfterSlippageUsd,
                      selectedDetailInfo === 'TOKEN' ? 6 : 2,
                      'floor',
                      MILLION,
                      0
                    )} ${currentUnit}`}</DetailInfoSubtext>
                  </DetailInfoTextWrapper>
                </DetailInfoInnerWrapper>

                <GasFeeWrapper>
                  <GasFeeInnerWrapper>
                    <GasFeeTitle>{t(`Gas fee`)}</GasFeeTitle>
                    <GasFeeTitleValue>
                      {estimatedFee
                        ? `~${formatNumber(estimatedFee, 6, 'floor', THOUSAND, 0)} XRP`
                        : t('calculating...')}
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
              </DetailInfoWrapper>
            </DetailWrapper>
          </>
        )}
        {isIdle && (
          <LoadingStep totalSteps={2} step={step} isLoading={stepLoading} isDone={isSuccess} />
        )}
        {isSuccess && (
          <TimeWrapper>
            <IconTime />
            {format(new Date(txDate), DATE_FORMATTER.FULL)}
            <ClickableIcon onClick={handleLink}>
              <IconLink />
            </ClickableIcon>
          </TimeWrapper>
        )}
      </Wrapper>
    </Popup>
  );
};

const _SwapPopupSkeleton = () => {
  const { t } = useTranslation();
  const { fromToken, selectedDetailInfo } = useSwapStore();
  return (
    <Popup id={POPUP_ID.SWAP} title={t('Swap preview')}>
      <SkeletonWrapper>
        <ListSkeleton height={191} title={t('Effective price')} />
        <DetailTitleWrapper>
          {t('swap-detail', { token: fromToken?.symbol })}
          <DetailButtonWrapper>
            <ButtonChipSmall text="TOKEN" selected={selectedDetailInfo === 'TOKEN'} />
            <ButtonChipSmall text="USD" selected={selectedDetailInfo === 'USD'} />
          </DetailButtonWrapper>
        </DetailTitleWrapper>
        <SkeletonBase height={62} />
        <SkeletonBase height={48} borderRadius={12} />
      </SkeletonWrapper>
    </Popup>
  );
};

const Wrapper = tw.div`
  px-24 pb-24 flex flex-col
`;

const SkeletonWrapper = tw.div`
  px-24 pb-24 flex flex-col gap-20
  md:gap-24
`;

const SuccessTitle = tw.div`
  text-neutral-100 font-b-20
  md:font-b-24
`;

const SuccessSubTitle = tw.div`
  text-center text-neutral-80 font-r-14
  md:font-r-16
`;

const SuccessWrapper = tw.div`
  flex-center flex-col gap-12
`;

const SuccessIconWrapper = tw.div`
  flex-center w-48 h-48 rounded-full bg-green-50
`;

const FailedWrapper = tw.div`
  flex-center flex-col gap-12
`;

const FailedIconWrapper = tw.div`
  flex-center w-48 h-48 rounded-full bg-red-50
`;

const ListWrapper = tw.div`
  relative
`;

const IconWrapper = tw.div`
  absolute right-12 bottom-56 z-1
`;

const ArrowDownWrapper = tw.div`
  p-6 flex-center rounded-full bg-neutral-20
`;

const DetailWrapper = tw.div`
  flex flex-col gap-16
`;

const DetailTitleWrapper = tw.div`
  px-12 flex items-center justify-between gap-12 font-m-16 text-neutral-100
`;

const DetailButtonWrapper = tw.div`
  flex gap-4
`;

const DetailInfoWrapper = tw.div`
  px-16 py-12 bg-neutral-15 rounded-8 flex flex-col gap-8
`;

const DetailInfoInnerWrapper = tw.div`
  flex flex-col gap-2
`;

const DetailInfoTextWrapper = tw.div`
  flex gap-10 justify-between
`;

const DetailInfoText = tw.div`
  font-r-14 text-neutral-100
`;

const DetailInfoSubtext = tw.div`
  font-r-12 text-neutral-60
`;
const Divider = tw.div`
  w-full h-1 bg-neutral-20 flex-shrink-0
`;

const ButtonWrapper = tw.div`
  w-full
`;
const TimeWrapper = styled.div(() => [
  tw`flex items-center gap-4 text-neutral-60`,
  css`
    & svg {
      width: 20px;
      height: 20px;
      fill: ${COLOR.NEUTRAL[60]};
    }
  `,
]);

const ClickableIcon = styled.div(() => [
  tw` clickable flex-center`,
  css`
    &:hover svg {
      fill: ${COLOR.NEUTRAL[80]};
    }
  `,
]);

const GasFeeWrapper = tw.div`
  flex-col
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

/*
{

  "meta": {
    "DeliveredAmount": {
      "currency": "5553444300000000000000000000000000000000",
      "issuer": "rPsLc5urbzLd5S39MWDo8GfkukqTTvdxvt",
      "value": "0.621643364"
    },
    "TransactionIndex": 0,
    "TransactionResult": "tesSUCCESS",
    "delivered_amount": {
      "currency": "5553444300000000000000000000000000000000",
      "issuer": "rPsLc5urbzLd5S39MWDo8GfkukqTTvdxvt",
      "value": "0.621643364"
    }
  },
  "validated": true,
  "swapAmountTo": "624359",
  "swapAmountFrom": "1000000"
}
*/
