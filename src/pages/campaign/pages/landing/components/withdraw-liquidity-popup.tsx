import { Fragment, Suspense, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import tw, { styled } from 'twin.macro';
import { formatUnits, parseUnits } from 'viem';
import * as yup from 'yup';

import { useUserCampaignInfo } from '~/api/api-contract/_evm/campaign/user-campaign-info.ts';
import { useWithdrawLiquidity } from '~/api/api-contract/_evm/campaign/withdraw-liquidity';
import { useUserAllTokenBalances } from '~/api/api-contract/balance/user-all-token-balances';
import { useUserPoolTokenBalances } from '~/api/api-contract/balance/user-pool-token-balances';

import { COLOR } from '~/assets/colors';
import { IconCancel, IconCheck, IconLink, IconTime } from '~/assets/icons';

import { POOL_ID, SCANNER_URL } from '~/constants';

import { ButtonPrimaryLarge } from '~/components/buttons';
import { InputNumber } from '~/components/inputs';
import { List } from '~/components/lists';
import { Popup } from '~/components/popup';
import { ListSkeleton } from '~/components/skeleton/list-skeleton';
import { SkeletonBase } from '~/components/skeleton/skeleton-base';
import { Token } from '~/components/token';
import { TokenList } from '~/components/token-list';

import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { DATE_FORMATTER, formatNumber, getNetworkFull } from '~/utils';
import { useWithdrawLiquidityNetworkFeeErrorStore } from '~/states/contexts/network-fee-error/network-fee-error';
import { IPool, NETWORK, POPUP_ID } from '~/types';

interface InputFormState {
  input1: number;
}
interface Props {
  pool?: IPool;
  lpTokenPrice: number;

  refetchBalance?: () => void;
}

export const WithdrawLiquidityPopup = ({ pool, lpTokenPrice, refetchBalance }: Props) => {
  return (
    <Suspense fallback={<_WithdrawLiquidityPopupSkeleton />}>
      <_WithdrawLiquidityPopup
        pool={pool}
        lpTokenPrice={lpTokenPrice}
        refetchBalance={refetchBalance}
      />
    </Suspense>
  );
};

const _WithdrawLiquidityPopup = ({ pool, lpTokenPrice, refetchBalance }: Props) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { isEvm, isFpass } = useNetwork();
  const { poolId, lpToken, compositions } = pool || {};
  const xrpToken = compositions?.[1];
  const xrpBalanceInPool = xrpToken?.balance || 0;

  const { t } = useTranslation();
  const { network: networkParam } = useParams();
  const { selectedNetwork } = useNetwork();

  const [inputValue, setInputValue] = useState<number>();
  const [inputValueRaw, setInputValueRaw] = useState<bigint>();

  const [estimatedWithdrawLiquidityFee, setEstimatedWithdrawLiquidityFee] = useState<
    number | undefined
  >();

  const currentNetwork = getNetworkFull(networkParam) ?? selectedNetwork;

  const { error: withdrawLiquidityGasError, setError: setWithdrawLiquidityGasError } =
    useWithdrawLiquidityNetworkFeeErrorStore();

  const { userAllTokenBalances } = useUserAllTokenBalances();
  const xrp = userAllTokenBalances?.find(t => t.symbol === 'XRP');
  const xrpBalance = xrp?.balance || 0;

  const { close } = usePopup(POPUP_ID.CAMPAIGN_WITHDRAW);

  const validAmount = inputValueRaw && inputValueRaw > 0n;

  const withdrawLiquidityEnabled = !!poolId && !!validAmount;
  const {
    isLoading: withdrawLiquidityLoading,
    isSuccess: withdrawLiquiditySuccess,
    txData,
    writeAsync,
    blockTimestamp,
    estimateFee: estimateWithdrawLiquidityFee,
  } = useWithdrawLiquidity({
    bptIn: inputValueRaw || 0n,
    enabled: withdrawLiquidityEnabled,
  });

  const { lpTokenTotalSupply, refetch } = useUserPoolTokenBalances({
    network: 'trn',
    id: POOL_ID?.[selectedNetwork]?.ROOT_XRP,
  });

  const { amountFarmedInBPT, amountFarmedInBPTRaw } = useUserCampaignInfo();
  const userLpTokenBalance = amountFarmedInBPT;
  const userLpTokenBalanceRaw = amountFarmedInBPTRaw || 0n;

  const userXrpOutBalance =
    !!inputValue && inputValue > 0 && xrpBalanceInPool > 0
      ? 2 * (inputValue / lpTokenTotalSupply) * xrpBalanceInPool
      : 0;

  const withdrawTokenValue = (inputValue || 0) * (lpTokenPrice || 0);

  const txDate = new Date(blockTimestamp || 0);
  const isIdle = !txData;
  const isSuccess = withdrawLiquiditySuccess && !!txData;
  const isLoading = withdrawLiquidityLoading;
  const totalValue = userXrpOutBalance * (xrpToken?.price || 0);

  const schema = yup.object().shape({
    input1: yup.number().min(0).max(userLpTokenBalance, t('Exceeds wallet balance')).required(),
  });

  const { control, setValue, formState } = useForm<InputFormState>({
    resolver: yupResolver(schema),
  });

  const buttonText = useMemo(() => {
    if (!isIdle) {
      if (isSuccess) return t('Return to voyage page');
      return t('Try again');
    }

    return t('Withdraw');
  }, [isSuccess, isIdle, t]);

  const handleButtonClick = async () => {
    if (isLoading) return;
    if (!isIdle) {
      if (isSuccess) {
        close();
        navigate(`/campaign`);
        return;
      }
      close();
      return;
    }

    await writeAsync?.();
  };

  const handleLink = () => {
    const txHash = isFpass ? txData?.extrinsicId : isEvm ? txData?.transactionHash : txData?.hash;
    const url = `${SCANNER_URL[currentNetwork || NETWORK.THE_ROOT_NETWORK]}/${
      isFpass ? 'extrinsic' : isEvm ? 'tx' : 'transactions'
    }/${txHash}`;

    window.open(url);
  };

  useEffect(() => {
    if (!isIdle) {
      queryClient.invalidateQueries(['GET', 'POOL']);
      refetchBalance?.();
      refetch?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isIdle, queryClient]);

  useEffect(() => {
    return () => {
      setWithdrawLiquidityGasError(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!estimateWithdrawLiquidityFee || !withdrawLiquidityEnabled) return;

    const estimateWithdrawLiquidityFeeAsync = async () => {
      const fee = await estimateWithdrawLiquidityFee?.();
      setEstimatedWithdrawLiquidityFee(fee ?? 4.2);
    };
    estimateWithdrawLiquidityFeeAsync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withdrawLiquidityEnabled]);

  const estimatedFee = estimatedWithdrawLiquidityFee || '';

  const gasError = xrpBalance <= Number(estimatedFee || 4.2) || withdrawLiquidityGasError;

  return (
    <Popup
      id={POPUP_ID.CAMPAIGN_WITHDRAW}
      title={isIdle ? t('Enter withdrawal amount') : ''}
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
      <Wrapper style={{ gap: isIdle ? 24 : 40 }}>
        {!isIdle && isSuccess && (
          <SuccessWrapper>
            <IconWrapper>
              <IconCheck width={40} height={40} />
            </IconWrapper>
            <SuccessTitle>{t('Withdrawal confirmed!')}</SuccessTitle>
            <SuccessSubTitle>
              {t('withdraw-success-message', { pool: lpToken?.symbol })}
            </SuccessSubTitle>
          </SuccessWrapper>
        )}
        {!isIdle && !isSuccess && (
          <FailedWrapper style={{ paddingBottom: '24px' }}>
            <FailedIconWrapper>
              <IconCancel width={40} height={40} />
            </FailedIconWrapper>
            <SuccessTitle>{t('Withdraw liquidity failed')}</SuccessTitle>
            <SuccessSubTitle>{t('withdraw-liquidity-fail-message')}</SuccessSubTitle>
          </FailedWrapper>
        )}
        {isIdle && (
          <List title={t(`You're providing`)}>
            <InputNumberWrapper>
              <InputNumber
                name={'input1'}
                control={control}
                token={<Token token={lpToken?.symbol || ''} image address={lpToken?.address} />}
                tokenName={lpToken?.symbol || ''}
                tokenValue={withdrawTokenValue}
                balance={userLpTokenBalance || 0}
                balanceRaw={userLpTokenBalanceRaw || 0n}
                value={inputValue}
                handleChange={val => {
                  setInputValue(val);
                  setInputValueRaw(parseUnits((val || 0).toFixed(18), 18));
                }}
                handleChangeRaw={val => {
                  setInputValue(Number(formatUnits(val || 0n, 18)));
                  setInputValueRaw(val);
                }}
                maxButton
                slider
                sliderActive
                setValue={setValue}
                formState={formState}
              />
            </InputNumberWrapper>
          </List>
        )}
        {isIdle && (
          <List title={t(`You're expected to receive`)}>
            <Fragment key={`XRP-1`}>
              <TokenList
                type="large"
                title={`${userXrpOutBalance.toFixed(6)} XRP`}
                description={`$${formatNumber(userXrpOutBalance * (xrpToken?.price || 0))}`}
                image={xrpToken?.image}
                leftAlign
              />
            </Fragment>
          </List>
        )}
        {!isIdle && isSuccess && (
          <List title={t(`You're received`)}>
            <Fragment key={`XRP-1`}>
              <TokenList
                type="large"
                title={`${userXrpOutBalance.toFixed(6)} XRP`}
                description={`$${formatNumber(userXrpOutBalance * (xrpToken?.price || 0))}`}
                image={xrpToken?.image}
                leftAlign
              />
            </Fragment>
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
                <SummaryTextTitle>{t('Total')}</SummaryTextTitle>
                <SummaryText>{`$${formatNumber(totalValue)}`}</SummaryText>
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

const _WithdrawLiquidityPopupSkeleton = () => {
  const { t } = useTranslation();
  return (
    <Popup id={POPUP_ID.CAMPAIGN_WITHDRAW} title={t('Enter withdrawal amount')}>
      <Wrapper>
        <ListSkeleton height={114} title={t("You're providing")} />
        <ListSkeleton height={183} title={t("You're expected to receive")} />
        <ListSkeleton height={122} title={t('Summary')} />
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

const InputNumberWrapper = tw.div`
  m-2
`;
