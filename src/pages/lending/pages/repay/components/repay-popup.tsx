import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import tw, { styled } from 'twin.macro';
import { Address, parseUnits } from 'viem';

import { useUserFeeTokenBalance } from '~/api/api-contract/balance/user-fee-token-balance';
import { useLendingRepay } from '~/api/api-contract/lending/repay';
import { useApprove } from '~/api/api-contract/token/approve';

import { COLOR } from '~/assets/colors';
import {
  IconArrowNext,
  IconCancel,
  IconCheck,
  IconInfinity,
  IconLink,
  IconTime,
} from '~/assets/icons';

import { MILLION, ROOT_ASSET_ID, SCANNER_URL, TRILLION } from '~/constants';

import { ButtonPrimaryLarge } from '~/components/buttons';
import { FeeProxySelector } from '~/components/fee-proxy-selector';
import { List } from '~/components/lists';
import { LoadingStep } from '~/components/loadings/step';
import { Popup } from '~/components/popup';
import { TokenList } from '~/components/token-list';

import { useGAAction } from '~/hooks/analaystics/ga-action';
import { useGAInView } from '~/hooks/analaystics/ga-in-view';
import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useMediaQuery } from '~/hooks/utils';
import { useConnectedWallet } from '~/hooks/wallets';
import { calculateHealthFactorColor, DATE_FORMATTER, formatNumber, getNetworkFull } from '~/utils';
import {
  useApproveNetworkFeeErrorStore,
  useLendingRepayNetworkFeeErrorStore,
} from '~/states/contexts/network-fee-error/network-fee-error';
import { useFeeTokenStore } from '~/states/data/fee-proxy';
import { IToken, NETWORK, POPUP_ID } from '~/types';

interface Props {
  tokenIn?: IToken & { amount: number; mTokenAddress: Address };

  currentHealthFactor?: number;
  nextHealthFactor?: number;
  debt?: number;

  isMax?: boolean;

  refetchBalance?: () => void;
  handleSuccess?: () => void;
}

export const LendingRepayPopup = ({
  tokenIn,

  currentHealthFactor,
  nextHealthFactor,
  debt,

  isMax,
  refetchBalance,
  handleSuccess,
}: Props) => {
  const { ref } = useGAInView({ name: 'lending-repay-popup' });
  const { gaAction } = useGAAction();

  const { error: lendingGasError, setError: setLendingRepayGasError } =
    useLendingRepayNetworkFeeErrorStore();
  const { error: approveGasError, setError: setApproveGasError } = useApproveNetworkFeeErrorStore();

  const { network } = useParams();
  const currentNetwork = getNetworkFull(network);

  const isRoot = currentNetwork === NETWORK.THE_ROOT_NETWORK;

  const { feeToken, setFeeToken, isNativeFee } = useFeeTokenStore();

  const navigate = useNavigate();

  const { t } = useTranslation();

  const { isEvm, isFpass, selectedNetwork } = useNetwork();
  const { evm, fpass } = useConnectedWallet();
  const walletAddress = isFpass ? fpass.address : evm.address;

  const { userFeeTokenBalanace: userFeeToken } = useUserFeeTokenBalance();
  const userFeeTokenBalance = userFeeToken?.balance || 0;

  const { close } = usePopup(POPUP_ID.LENDING_REPAY);

  const { isMD } = useMediaQuery();

  const [estimatedLendingRepayFee, setEstimatedLendingRepayFee] = useState<number | undefined>();
  const [estimatedTokenApproveFee, setEstimatedTokenApproveFee] = useState<number | undefined>();

  const { symbol, mTokenAddress, amount, price, image, decimal, address, currency } = tokenIn || {};
  const currentHealthFactorColor = calculateHealthFactorColor(currentHealthFactor || 100);
  const nextHealthFactorColor = calculateHealthFactorColor(nextHealthFactor || 100);

  const {
    allow,
    allowance,
    isLoading: allowLoading,
    isSuccess: allowSuccess,
    refetch: refetchAllowance,
    estimateFee: estimateTokenApproveFee,
  } = useApprove({
    amount: parseUnits(`${(amount || 0).toFixed(18)}`, decimal || 18),
    symbol: symbol || '',
    address: address || '',
    issuer: address || '',
    spender: mTokenAddress,
    currency: currency || '',
    enabled: !!amount && amount > 0,
  });

  const {
    isLoading: repayLoading,
    isSuccess: repaySuccess,
    isError,
    txData,
    blockTimestamp,
    writeAsync,
    estimateFee: estimateLendingRepayFee,
  } = useLendingRepay({
    token: tokenIn,
    isMax,
    enabled: !!tokenIn && !!amount && amount > 0 && !!mTokenAddress,
  });

  const txDate = new Date(blockTimestamp || 0);
  const isIdle = !txData || !(isError || repaySuccess);
  const isSuccess = repaySuccess && !!txData;
  const isLoading = repayLoading || allowLoading;

  const step = allowance ? 2 : 1;
  const stepLoading = step === 1 ? allowLoading : repayLoading;

  const buttonText = useMemo(() => {
    if (!isIdle) {
      if (isSuccess) return t('Return to lending page');
      return t('Try again');
    }

    if (!allowance)
      return allowLoading
        ? t('approve-loading')
        : t('approve-lending-repay-token-message', { token: symbol });

    return repayLoading
      ? t('lending-repay-button-loading')
      : t('lending-repay-button', { token: symbol });
  }, [allowLoading, allowance, isIdle, isSuccess, repayLoading, symbol, t]);

  const isValid = (amount || 0) <= (debt || 0);
  const handleButtonClick = async () => {
    if (isLoading || !isValid) return;

    if (!isIdle) {
      gaAction({
        action: 'go-to-lending-page',
        data: { component: 'lending-repay-popup', link: `lending` },
      });

      close();
      navigate(`/lending`);
      return;
    }

    if (!allowance) {
      gaAction({
        action: 'approve-token',
        data: { component: 'lending-repay-popup', token: symbol, amount },
      });

      await allow();
      return;
    }

    gaAction({
      action: 'lending-repay',
      data: {
        component: 'lending-repay-popup',
        tokenIn,
        amount,
        mTokenAddress,
        estimatedFee,
        walletAddress,
        userFeeTokenBalance,
      },
    });
    await writeAsync?.();
  };

  const handleLink = () => {
    const txHash = isFpass ? txData?.extrinsicId : txData?.transactionHash;
    const url = `${SCANNER_URL[currentNetwork || NETWORK.THE_ROOT_NETWORK]}/${
      isFpass ? 'extrinsics' : isEvm ? 'tx' : 'transactions'
    }/${txHash}`;

    gaAction({
      action: 'go-to-transaction',
      data: { component: 'lending-repay-popup', txHash: txHash, link: url },
    });

    window.open(url);
  };

  useEffect(() => {
    if (allowSuccess) refetchAllowance();
  }, [allowSuccess, refetchAllowance]);

  useEffect(() => {
    if (isSuccess) {
      handleSuccess?.();
      refetchBalance?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, refetchBalance]);

  useEffect(() => {
    return () => {
      setLendingRepayGasError(false);
      setApproveGasError(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (step !== 1 || (amount || 0) <= 0) return;

    setEstimatedTokenApproveFee(0);
    const estimateApproveFeeAsync = async () => {
      const fee = await estimateTokenApproveFee?.();
      setEstimatedTokenApproveFee(fee || 1);
    };
    estimateApproveFeeAsync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, step, feeToken]);

  useEffect(() => {
    if (step !== 2 || (amount || 0) <= 0) return;

    setEstimatedLendingRepayFee(0);
    const estimateLendingRepayFeeAsync = async () => {
      const fee = await estimateLendingRepayFee?.();
      setEstimatedLendingRepayFee(fee || 1);
    };
    estimateLendingRepayFeeAsync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, step, feeToken]);

  useEffect(() => {
    setFeeToken({
      name: 'XRP',
      assetId: ROOT_ASSET_ID.XRP,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNetwork]);

  const estimatedFee = step === 1 ? estimatedTokenApproveFee : estimatedLendingRepayFee;
  const gasError =
    (userFeeTokenBalance || 0) <= Number(estimatedFee || 4) || lendingGasError || approveGasError;

  return (
    <Popup
      id={POPUP_ID.LENDING_REPAY}
      title={isIdle ? t('Repayment preview') : ''}
      button={
        <ButtonWrapper
          onClick={() => handleButtonClick()}
          style={{ marginTop: isIdle || isLoading ? '24px' : '16px' }}
        >
          <ButtonPrimaryLarge
            text={buttonText}
            isLoading={isLoading}
            buttonType={isIdle ? 'filled' : 'outlined'}
            disabled={(isIdle && gasError) || !estimatedFee}
          />
        </ButtonWrapper>
      }
      setting={isRoot && isFpass && isIdle && <FeeProxySelector />}
    >
      <Wrapper style={{ gap: isIdle ? (isMD ? 24 : 20) : 40 }} ref={ref}>
        {!isIdle && isSuccess && (
          <SuccessWrapper>
            <IconWrapper>
              <IconCheck width={40} height={40} />
            </IconWrapper>
            <SuccessTitle>{t('Repayment confirmed!')}</SuccessTitle>
            <SuccessSubTitle>
              {t('repay-success-message', {
                token: symbol,
                amount: formatNumber(amount, 6, 'floor', TRILLION, 0),
              })}
            </SuccessSubTitle>
          </SuccessWrapper>
        )}
        {!isIdle && isError && (
          <FailedWrapper style={{ paddingBottom: '24px' }}>
            <FailedIconWrapper>
              <IconCancel width={40} height={40} />
            </FailedIconWrapper>
            <SuccessTitle>{t('Repayment failed')}</SuccessTitle>
            <SuccessSubTitle>{t('repay-failed-message', { token: symbol })}</SuccessSubTitle>
          </FailedWrapper>
        )}
        {isIdle && (
          <List title={t(`You're expected to repay`)}>
            <TokenList
              type="large"
              title={`${formatNumber(amount, 6, 'floor', TRILLION, 0)} ${symbol}`}
              description={`$${formatNumber(
                (amount || 0) * (price || 0),
                2,
                'floor',
                TRILLION,
                0
              )}`}
              image={image}
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
              <ListInnerWrapper>
                <Summary>
                  <SummaryTextTitle>{t('Remaining debt')}</SummaryTextTitle>
                  <SummaryText>
                    <span style={{ fontWeight: 500 }}>{`$${formatNumber(
                      debt,
                      2,
                      'floor',
                      MILLION,
                      2
                    )} ${symbol}`}</span>
                    <IconArrowNext width={12} height={12} fill={COLOR.NEUTRAL[60]} />
                    <span style={{ fontWeight: 500 }}>{`$${formatNumber(
                      (debt || 0) - (amount || 0),
                      2,
                      'floor',
                      MILLION,
                      2
                    )} ${symbol}`}</span>
                  </SummaryText>
                </Summary>
                <Summary>
                  <SummaryTextTitle>{t('Health factor')}</SummaryTextTitle>
                  <SummaryText>
                    <span
                      style={{
                        fontWeight: 'bold',
                        color: currentHealthFactorColor,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {isFinite(currentHealthFactor || 0) ? (
                        formatNumber(currentHealthFactor, 2, 'floor', MILLION, 2)
                      ) : (
                        <IconInfinity width={22} height={22} fill={COLOR.GREEN[50]} />
                      )}
                    </span>
                    <IconArrowNext width={12} height={12} fill={COLOR.NEUTRAL[60]} />
                    <span
                      style={{
                        fontWeight: 'bold',
                        color: nextHealthFactorColor,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {isFinite(nextHealthFactor || 0) ? (
                        formatNumber(nextHealthFactor, 2, 'floor', MILLION, 2)
                      ) : (
                        <IconInfinity width={22} height={22} fill={COLOR.GREEN[50]} />
                      )}
                    </span>
                  </SummaryText>
                </Summary>
                <Divider />
                <GasFeeWrapper>
                  <GasFeeInnerWrapper>
                    <GasFeeTitle>{t(`Gas fee`)}</GasFeeTitle>
                    <GasFeeTitleValue>
                      {estimatedFee
                        ? `~${formatNumber(estimatedFee)} ${feeToken.name}`
                        : t('calculating...')}
                    </GasFeeTitleValue>
                  </GasFeeInnerWrapper>
                  <GasFeeInnerWrapper>
                    <GasFeeCaption error={gasError}>
                      {gasError
                        ? isNativeFee
                          ? t(`Not enough balance to pay for Gas Fee.`)
                          : t(`fee-proxy-error-message`, { token: feeToken.name })
                        : t(`May change when network is busy`)}
                    </GasFeeCaption>
                  </GasFeeInnerWrapper>
                </GasFeeWrapper>
              </ListInnerWrapper>
            </List>

            <LoadingStep totalSteps={2} step={step} isLoading={stepLoading} isDone={isSuccess} />
          </>
        )}
      </Wrapper>
    </Popup>
  );
};

const Divider = tw.div`
  w-full h-1 flex-shrink-0 bg-neutral-20
`;

const Wrapper = tw.div`
  flex flex-col gap-20 px-20 py-0
  md:(gap-24 px-24)
`;

const ListInnerWrapper = tw.div`
  flex flex-col gap-12 py-12 px-16
`;

const SuccessTitle = tw.div`
  text-neutral-100 font-b-20
  md:font-b-24
`;

const SuccessSubTitle = tw.div`
  text-neutral-80 font-r-14
  md:font-r-16
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
  flex justify-between bg-neutral-15 gap-16
`;

const SummaryTextTitle = tw.div`
  text-neutral-100 font-r-14
`;

const SummaryText = tw.div`
  text-neutral-100 font-m-14 flex items-center gap-4
`;

const ButtonWrapper = tw.div`
  mt-24 w-full
`;

const Scanner = tw.div`
  flex items-start gap-4 clickable
`;

const ScannerText = tw.div`
  font-r-12 text-neutral-60
`;

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
