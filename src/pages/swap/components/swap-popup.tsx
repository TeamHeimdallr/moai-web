import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { last } from 'lodash-es';
import tw, { css, styled } from 'twin.macro';
import { Address, formatUnits, parseUnits } from 'viem';
import { usePrepareContractWrite } from 'wagmi';

import { useUserAllTokenBalances } from '~/api/api-contract/balance/user-all-token-balances';
import { useSwap } from '~/api/api-contract/swap/swap';
import { useApprove } from '~/api/api-contract/token/approve';
import { useSorQuery } from '~/api/api-server/sor/batch-swap';

import { COLOR } from '~/assets/colors';
import { IconArrowDown, IconCancel, IconCheck, IconLink, IconTime } from '~/assets/icons';

import { EVM_VAULT_ADDRESS, SCANNER_URL } from '~/constants';

import { ButtonChipSmall, ButtonPrimaryLarge } from '~/components/buttons';
import { List } from '~/components/lists';
import { LoadingStep } from '~/components/loadings';
import { Popup } from '~/components/popup';
import { TokenList } from '~/components/token-list';

import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import {
  DATE_FORMATTER,
  formatFloat,
  formatNumber,
  getNetworkFull,
  getTokenDecimal,
} from '~/utils';
import {
  useApproveNetworkFeeErrorStore,
  useSwapNetworkFeeErrorStore,
} from '~/states/contexts/network-fee-error/network-fee-error';
import { useSlippageStore } from '~/states/data';
import { useSwapStore } from '~/states/pages';
import { IPool, NETWORK, SwapKind } from '~/types';
import { POPUP_ID } from '~/types/components';

import { BALANCER_VAULT_ABI } from '~/abi';

interface Props {
  swapOptimizedPathPool?: IPool;
  refetchBalance?: () => void;
}
export const SwapPopup = ({ swapOptimizedPathPool, refetchBalance }: Props) => {
  const { error: swapGasError, setError: setSwapGasError } = useSwapNetworkFeeErrorStore();
  const { error: approveGasError, setError: setApproveGasError } = useApproveNetworkFeeErrorStore();

  const { userAllTokenBalances } = useUserAllTokenBalances();
  const xrp = userAllTokenBalances?.find(t => t.symbol === 'XRP');
  const xrpBalance = xrp?.balance || 0;

  const queryClient = useQueryClient();

  const { t } = useTranslation();
  const { network } = useParams();
  const { selectedNetwork, isXrp, isFpass, isEvm } = useNetwork();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const { currentAddress } = useConnectedWallet(currentNetwork);

  const { close } = usePopup(POPUP_ID.SWAP);
  const { slippage: slippageRaw } = useSlippageStore();

  const [selectedDetailInfo, selectDetailInfo] = useState<'TOKEN' | 'USD'>('TOKEN');
  const [estimatedSwapFee, setEstimatedSwapFee] = useState<number | undefined>();
  const [estimatedFromTokenApproveFee, setEstimatedFromTokenApproveFee] = useState<
    number | undefined
  >();
  const [estimatedToTokenApproveFee, setEstimatedToTokenApproveFee] = useState<
    number | undefined
  >();

  const slippage = Number(slippageRaw || 0);
  const {
    fromToken,
    toToken,

    fromInput,
  } = useSwapStore();
  const numFromInput = Number(fromInput) || 0;

  const { data: swapInfoData } = useSorQuery(
    {
      queries: {
        network: currentNetwork,
        from: fromToken?.address || '',
        to: toToken?.address || '',
        amount: parseUnits(
          (Number(fromInput) || 0).toFixed(18),
          getTokenDecimal(currentNetwork, fromToken?.symbol)
        ).toString(),
      },
    },
    {
      enabled: currentNetwork === NETWORK.THE_ROOT_NETWORK && !!fromToken && !!toToken,
      staleTime: 2000,
    }
  );
  const swapsRaw = swapInfoData?.data.swaps ?? [];
  const swaps = swapsRaw.map(({ poolId, assetInIndex, assetOutIndex, amount, userData }) => [
    poolId,
    assetInIndex,
    assetOutIndex,
    amount,
    userData,
  ]);
  const assets = swapInfoData?.data.tokenAddresses ?? [];
  const { data } = usePrepareContractWrite({
    address: EVM_VAULT_ADDRESS[currentNetwork] as Address,
    abi: BALANCER_VAULT_ABI,
    functionName: 'queryBatchSwap',
    args: [SwapKind.GivenIn, swaps, assets, [currentAddress, false, currentAddress, false]],
    enabled: !!currentAddress && !!swaps?.length && !!assets?.length,
    staleTime: 1000 * 10,
  });

  const toInputFromSor = -Number(
    formatUnits(
      last((data?.result || []) as bigint[]) || 0n,
      getTokenDecimal(currentNetwork, toToken?.symbol)
    )
  );

  /* swap optimized path pool의 해당 토큰 balance와 price */
  const { balance: fromTokenReserveRaw } = swapOptimizedPathPool?.compositions?.find(
    c => c.symbol === fromToken?.symbol
  ) || {
    balance: 0,
    price: 0,
  };
  const fromTokenReserve = fromTokenReserveRaw || 0;
  /* swap optimized path pool의 해당 토큰 balance와 price */
  const { balance: toTokenReserveRaw } = swapOptimizedPathPool?.compositions?.find(
    c => c.symbol === toToken?.symbol
  ) || {
    balance: 0,
    price: 0,
  };
  const toTokenReserve = toTokenReserveRaw || 0;

  const fee = swapOptimizedPathPool?.tradingFee || 0;

  const toInputFromSinglePool =
    fromToken && toToken
      ? fromInput
        ? Number(
            formatFloat(
              toTokenReserve -
                toTokenReserve * (fromTokenReserve / (fromTokenReserve + numFromInput * (1 - fee))),
              6
            )
          )
        : undefined
      : undefined;

  const toInput = toInputFromSor || toInputFromSinglePool || 0;
  const numToInput = Number(toInput) || 0;
  const swapRatio =
    fromInput && toInput
      ? numToInput / (numFromInput === 0 ? 0.0001 : numFromInput)
      : toTokenReserve - toTokenReserve * (fromTokenReserve / (fromTokenReserve + (1 - fee)));

  const fromApproveEnabled = fromToken && numFromInput > 0 && !isXrp;
  const toApproveEnabled = toToken && numToInput > 0 && isXrp;

  const {
    allow: allowFromToken,
    allowance: allowanceFromToken,
    isLoading: allowFromTokenLoading,
    isSuccess: allowFromTokenSuccess,
    refetch: refetchFromTokenAllowance,
    estimateFee: estimateFromTokenApproveFee,
  } = useApprove({
    amount: parseUnits(
      `${(numFromInput || 0).toFixed(18)}`,
      getTokenDecimal(currentNetwork, fromToken?.symbol || '')
    ),
    symbol: fromToken?.symbol || '',
    address: fromToken?.address || '',
    issuer: fromToken?.address || '',
    spender: EVM_VAULT_ADDRESS[currentNetwork] || '',
    currency: fromToken?.currency || '',
    enabled: fromApproveEnabled,
  });

  const {
    allow: allowToToken,
    allowance: allowanceToToken,
    isLoading: allowToTokenLoading,
    isSuccess: allowToTokenSuccess,
    refetch: refetchToTokenAllowance,
    estimateFee: estimateToTokenApproveFee,
  } = useApprove({
    amount: parseUnits(
      `${(numToInput || 0).toFixed(18)}`,
      getTokenDecimal(currentNetwork, toToken?.symbol || '')
    ),
    symbol: toToken?.symbol || '',
    address: toToken?.address || '',
    issuer: toToken?.address || '',
    spender: EVM_VAULT_ADDRESS[currentNetwork] || '',
    currency: toToken?.currency || '',
    enabled: toApproveEnabled,
  });

  const validAmount = numFromInput > 0 || numToInput > 0;
  const validAllowance = isXrp ? allowanceToToken : allowanceFromToken;
  const swapEnabled =
    !!(swapInfoData || swapOptimizedPathPool?.poolId) && validAllowance && validAmount;

  const {
    txData,
    blockTimestamp,
    isLoading: swapLoading,
    isSuccess: swapSuccess,
    swap,
    estimateFee: estimateSwapFee,
  } = useSwap({
    id: swapOptimizedPathPool?.poolId || '',
    fromToken: fromToken,
    fromInput: numFromInput,
    toToken: toToken,
    toInput: numToInput,
    enabled: swapEnabled,
  });

  const txDate = new Date(blockTimestamp || 0);
  const isIdle = !txData;
  const isSuccess = swapSuccess && !!txData;
  const isLoading = swapLoading || allowFromTokenLoading || allowToTokenLoading;

  const effectivePrice =
    fromToken && toToken && swapRatio
      ? `1 ${fromToken.symbol} = ${formatNumber(swapRatio, 6)} ${toToken.symbol}`
      : '';

  const fromTokenPrice =
    fromToken?.price ||
    swapOptimizedPathPool?.compositions?.find(c => c.symbol === fromToken?.symbol)?.price ||
    0;
  const fromTokenValue = numFromInput * fromTokenPrice;
  const toTokenPrice =
    toToken?.price ||
    swapOptimizedPathPool?.compositions?.find(c => c.symbol === toToken?.symbol)?.price ||
    0;
  const toTokenValue = numToInput * toTokenPrice;
  const toTokenActualAmount = Number(
    formatUnits(txData?.swapAmountTo ?? 0n, getTokenDecimal(currentNetwork, toToken?.symbol))
  );
  const fromTokenActualAmount = Number(
    formatUnits(txData?.swapAmountFrom ?? 0n, getTokenDecimal(currentNetwork, fromToken?.symbol))
  );

  const toTokenFinalValue = toTokenActualAmount * toTokenPrice;

  // const currentValue = selectedDetailInfo === 'TOKEN' ? numToInput : toTokenValue;
  const currentUnit = selectedDetailInfo === 'TOKEN' ? toToken?.symbol || '' : 'USD';
  const totalAfterFee = numToInput; // (1 - (swapOptimizedPathPool?.tradingFee || 0.003)) * (currentValue || 0);

  const slippageText = `${Number(slippage.toFixed(2))}%`;
  const totalAfterSlippage = (1 - slippage / 100) * totalAfterFee;

  const step = useMemo(() => {
    if (isSuccess) return 2;

    if (isXrp && allowanceToToken) return 2;
    if (!isXrp && allowanceFromToken) return 2;

    return 1;
  }, [allowanceFromToken, allowanceToToken, isSuccess, isXrp]);

  const stepLoading = useMemo(() => {
    if (isXrp) {
      if (step === 1) return allowToTokenLoading;
      if (step === 2) return swapLoading;
    } else {
      if (step === 1) return allowFromTokenLoading;
      if (step === 2) return swapLoading;
    }

    return false;
  }, [allowFromTokenLoading, allowToTokenLoading, isXrp, step, swapLoading]);

  const buttonText = useMemo(() => {
    if (!isIdle) {
      if (isSuccess) return t('Close');
      return t('Try again');
    }

    if (isXrp) {
      if (!allowanceToToken) return t('approve-swap-message', { token: toToken?.symbol });
      return t('Confirm swap');
    } else {
      if (!allowanceFromToken) return t('approve-swap-message', { token: fromToken?.symbol });
      return t('Confirm swap');
    }
  }, [
    allowanceFromToken,
    allowanceToToken,
    fromToken?.symbol,
    isSuccess,
    isXrp,
    t,
    isIdle,
    toToken?.symbol,
  ]);

  const handleButtonClick = async () => {
    if (isLoading) return;
    if (!isIdle) {
      close();
      return;
    }

    if (isXrp) {
      if (allowanceToToken) return await swap?.();
      else await allowToToken();
    } else {
      if (allowanceFromToken) return await swap?.();
      else await allowFromToken();
    }
  };

  const handleLink = () => {
    const txHash = isFpass ? txData?.extrinsicId : isEvm ? txData?.transactionHash : txData?.hash;
    const url = `${SCANNER_URL[network || NETWORK.THE_ROOT_NETWORK]}/${
      isFpass ? 'extrinsic' : isEvm ? 'tx' : 'transactions'
    }/${txHash}`;

    window.open(url);
  };

  useEffect(() => {
    if (allowFromTokenSuccess) refetchFromTokenAllowance();
    if (allowToTokenSuccess) refetchToTokenAllowance();
  }, [
    allowFromTokenSuccess,
    allowToTokenSuccess,
    refetchFromTokenAllowance,
    refetchToTokenAllowance,
  ]);

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
    if (!swapEnabled || step !== 2) return;

    const estimateSwapFeeAsync = async () => {
      const fee = await estimateSwapFee?.();
      setEstimatedSwapFee(fee ?? 3.25);
    };
    estimateSwapFeeAsync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swapEnabled, step]);

  useEffect(() => {
    if (step !== 1) return;
    if (isXrp && !toApproveEnabled) return;
    if (!isXrp && !fromApproveEnabled) return;

    const estimateApproveFeeAsync = async () => {
      if (isXrp) {
        const fee = await estimateToTokenApproveFee?.();
        setEstimatedToTokenApproveFee(fee ?? 1.5);
      } else {
        const fee = await estimateFromTokenApproveFee?.();
        setEstimatedFromTokenApproveFee(fee ?? 1.5);
      }
    };
    estimateApproveFeeAsync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isXrp, toApproveEnabled, fromApproveEnabled, step]);

  const estimatedFee = !isXrp
    ? step === 1
      ? estimatedFromTokenApproveFee || ''
      : estimatedSwapFee || ''
    : (step === 1 ? estimatedToTokenApproveFee : estimatedSwapFee) || '3.25';

  // TODO change after fee proxy
  const validMaxXrpAmount =
    fromToken?.symbol === 'XRP' ? numFromInput + Number(estimatedFee || 3.25) < xrpBalance : true;

  const gasError =
    xrpBalance <= Number(estimatedFee || 3.25) ||
    swapGasError ||
    approveGasError ||
    !validMaxXrpAmount;

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
            disabled={isIdle && (!fromToken || !toToken || gasError)}
          />
        </ButtonWrapper>
      }
    >
      <Wrapper style={{ gap: isIdle ? 24 : 40 }}>
        {!isIdle && isSuccess && (
          <>
            <SuccessWrapper>
              <SuccessIconWrapper>
                <IconCheck width={40} height={40} />
              </SuccessIconWrapper>
              <SuccessTitle>{t('Swap confirmed!')}</SuccessTitle>
              {fromTokenActualAmount && toTokenActualAmount && (
                <SuccessSubTitle>
                  {t('swap-success-message', {
                    fromValue: fromTokenActualAmount,
                    fromToken: fromToken?.symbol,
                    toValue: formatNumber(toTokenActualAmount, 6),
                    toToken: toToken?.symbol,
                  })}
                </SuccessSubTitle>
              )}
            </SuccessWrapper>

            <List title={t(`Total swap`)}>
              <TokenList
                title={`${formatNumber(toTokenActualAmount, 6)} ${toToken?.symbol}`}
                description={`$${formatNumber(toTokenFinalValue, 4)}`}
                image={toToken?.image}
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
                  title={`${fromInput} ${fromToken?.symbol}`}
                  description={`$${formatNumber(fromTokenValue, 4)}`}
                  image={fromToken?.image}
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
                  title={`${toInput} ${toToken?.symbol}`}
                  description={`$${formatNumber(toTokenValue, 4)}`}
                  image={toToken?.image}
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
                      totalAfterFee,
                      6
                    )} ${currentUnit}`}</DetailInfoText>
                  </DetailInfoTextWrapper>
                  <DetailInfoTextWrapper>
                    <DetailInfoSubtext>
                      {t('least-user-get-message', { slippage: slippageText })}
                    </DetailInfoSubtext>
                    <DetailInfoSubtext>{`${formatNumber(
                      totalAfterSlippage,
                      6
                    )} ${currentUnit}`}</DetailInfoSubtext>
                  </DetailInfoTextWrapper>
                </DetailInfoInnerWrapper>

                <GasFeeWrapper>
                  <GasFeeInnerWrapper>
                    <GasFeeTitle>{t(`Gas fee`)}</GasFeeTitle>
                    <GasFeeTitleValue>
                      {estimatedFromTokenApproveFee ||
                      estimatedToTokenApproveFee ||
                      estimatedSwapFee
                        ? `~${estimatedFee} XRP`
                        : 'calculating...'}
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

const Wrapper = tw.div`
  px-24 pb-24 flex flex-col
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
