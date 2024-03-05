import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import tw, { styled } from 'twin.macro';
import { Address } from 'viem';

import { useRedeemUnderlying } from '~/api/api-contract/lending/redeem-underlying';

import { COLOR } from '~/assets/colors';
import {
  IconArrowNext,
  IconCancel,
  IconCheck,
  IconInfinity,
  IconLink,
  IconTime,
} from '~/assets/icons';

import { MILLION, SCANNER_URL, TRILLION } from '~/constants';

import { ButtonPrimaryLarge } from '~/components/buttons';
import { List } from '~/components/lists';
import { Popup } from '~/components/popup';
import { TokenList } from '~/components/token-list';

import { useGAAction } from '~/hooks/analaystics/ga-action';
import { useGAInView } from '~/hooks/analaystics/ga-in-view';
import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useMediaQuery } from '~/hooks/utils';
import { calculateHealthFactorColor, DATE_FORMATTER, formatNumber, getNetworkFull } from '~/utils';
import { useLendingWithdrawNetworkFeeErrorStore } from '~/states/contexts/network-fee-error/network-fee-error';
import { IToken, NETWORK, POPUP_ID } from '~/types';

interface Props {
  tokenIn?: IToken & { amount: number; mTokenAddress: Address };

  userTokenBalance?: number;
  currentHealthFactor?: number;
  nextHealthFactor?: number;
  supplied?: number;
  isMax?: boolean;

  handleSuccess?: () => void;
}

export const LendingWithdrawPopup = ({
  tokenIn,

  userTokenBalance,
  currentHealthFactor,
  nextHealthFactor,
  supplied,
  isMax,

  handleSuccess,
}: Props) => {
  const { ref } = useGAInView({ name: 'lending-withdraw-popup' });
  const { gaAction } = useGAAction();

  const { error: lendingGasError, setError: setLendingWithdrawGasError } =
    useLendingWithdrawNetworkFeeErrorStore();

  const { network } = useParams();
  const currentNetwork = getNetworkFull(network);

  const navigate = useNavigate();

  const { t } = useTranslation();

  const { isEvm, isFpass } = useNetwork();
  const { close } = usePopup(POPUP_ID.LENDING_WITHDRAW);

  const { isMD } = useMediaQuery();

  const [estimatedLendingWithdrawFee, setEstimatedLendingWithdrawFee] = useState<
    number | undefined
  >();

  const { symbol, mTokenAddress, amount, price, image } = tokenIn || {};
  const currentHealthFactorColor = calculateHealthFactorColor(currentHealthFactor || 100);
  const nextHealthFactorColor = calculateHealthFactorColor(nextHealthFactor || 100);

  const {
    isLoading,
    isSuccess: withdrawSuccess,
    isError,
    txData,
    blockTimestamp,
    writeAsync,
    estimateFee: estimateLendingWithdrawFee,
  } = useRedeemUnderlying({
    token: tokenIn,
    isMax,
    enabled: !!tokenIn && !!amount && amount > 0 && !!mTokenAddress,
  });

  const txDate = new Date(blockTimestamp || 0);
  const isIdle = !txData || !(isError || withdrawSuccess);
  const isSuccess = withdrawSuccess && !!txData;

  const buttonText = useMemo(() => {
    if (!isIdle) {
      if (isSuccess) return t('Return to lending page');
      return t('Try again');
    }

    return isLoading
      ? t('lending-withdraw-button-loading')
      : t('lending-withdraw-button', { token: symbol });
  }, [isIdle, isLoading, isSuccess, symbol, t]);

  const isValid = (amount || 0) <= (supplied || 0);
  const handleButtonClick = async () => {
    if (isLoading || !isValid) return;

    if (!isIdle) {
      gaAction({
        action: 'go-to-lending-page',
        data: { component: 'lending-withdraw-popup', link: `lending` },
      });

      close();
      navigate(`/lending`);
      return;
    }

    await writeAsync?.();
  };

  const handleLink = () => {
    const txHash = isFpass ? txData?.extrinsicId : txData?.transactionHash;
    const url = `${SCANNER_URL[currentNetwork || NETWORK.THE_ROOT_NETWORK]}/${
      isFpass ? 'extrinsics' : isEvm ? 'tx' : 'transactions'
    }/${txHash}`;

    gaAction({
      action: 'go-to-transaction',
      data: { component: 'lending-withdraw-popup', txHash: txHash, link: url },
    });

    window.open(url);
  };

  useEffect(() => {
    if (isSuccess) handleSuccess?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  useEffect(() => {
    return () => setLendingWithdrawGasError(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if ((amount || 0) <= 0) return;

    const estimateLendingWithdrawFeeAsync = async () => {
      const fee = await estimateLendingWithdrawFee?.();
      setEstimatedLendingWithdrawFee(fee || 1);
    };
    estimateLendingWithdrawFeeAsync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount]);

  const estimatedFee = estimatedLendingWithdrawFee || 1;
  const gasError = (userTokenBalance || 0) <= Number(estimatedFee || 1) || lendingGasError;

  return (
    <Popup
      id={POPUP_ID.LENDING_WITHDRAW}
      title={isIdle ? t('Withdraw preview') : ''}
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
    >
      <Wrapper style={{ gap: isIdle ? (isMD ? 24 : 20) : 40 }} ref={ref}>
        {!isIdle && isSuccess && (
          <SuccessWrapper>
            <IconWrapper>
              <IconCheck width={40} height={40} />
            </IconWrapper>
            <SuccessTitle>{t('Withdrawal confirmed!')}</SuccessTitle>
            <SuccessSubTitle>
              {t('lending-withdraw-success-message', {
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
            <SuccessTitle>{t('Withdrawal failed')}</SuccessTitle>
            <SuccessSubTitle>{t('withdrawal-failed-message', { token: symbol })}</SuccessSubTitle>
          </FailedWrapper>
        )}
        {isIdle && (
          <List title={t(`You're expected to receive`)}>
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
                  <SummaryTextTitle>{t('Remaining supply')}</SummaryTextTitle>
                  <SummaryText>{`${formatNumber(
                    (supplied || 0) - (amount || 0),
                    2,
                    'floor',
                    MILLION,
                    2
                  )} ${symbol}`}</SummaryText>
                </Summary>
                <Summary>
                  <SummaryTextTitle>{t('Health factor')}</SummaryTextTitle>
                  <SummaryText>
                    <span style={{ fontWeight: 'bold', color: currentHealthFactorColor }}>
                      {isFinite(currentHealthFactor || 0) ? (
                        formatNumber(currentHealthFactor)
                      ) : (
                        <IconInfinity width={22} height={22} fill={COLOR.GREEN[50]} />
                      )}
                    </span>
                    <IconArrowNext width={12} height={12} fill={COLOR.NEUTRAL[60]} />
                    <span style={{ fontWeight: 'bold', color: nextHealthFactorColor }}>
                      {isFinite(nextHealthFactor || 0) ? (
                        formatNumber(nextHealthFactor)
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
              </ListInnerWrapper>
            </List>
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
