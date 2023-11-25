import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import tw, { css, styled } from 'twin.macro';

import { useSwap } from '~/api/api-contract/swap/swap';
import { useApprove } from '~/api/api-contract/token/approve';
import { useGetPoolVaultAmmQuery } from '~/api/api-server/pools/get-pool-vault-amm';

import { COLOR } from '~/assets/colors';
import { IconArrowDown, IconCheck, IconLink, IconTime } from '~/assets/icons';

import { SCANNER_URL } from '~/constants';

import { ButtonChipSmall, ButtonPrimaryLarge } from '~/components/buttons';
import { List } from '~/components/lists';
import { LoadingStep } from '~/components/loadings';
import { Popup } from '~/components/popup';
import { TokenList } from '~/components/token-list';

import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { DATE_FORMATTER, formatFloat, formatNumber, getNetworkAbbr, getNetworkFull } from '~/utils';
import { useSlippageStore } from '~/states/data';
import { useSwapStore } from '~/states/pages';
import { IPool } from '~/types';
import { POPUP_ID } from '~/types/components';

interface Props {
  swapOptimizedPathPool?: IPool;
  refetchBalance?: () => void;
}
export const SwapPopup = ({ swapOptimizedPathPool, refetchBalance }: Props) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { t } = useTranslation();
  const { network } = useParams();
  const { selectedNetwork, isXrp } = useNetwork();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const currentNetworkAbbr = getNetworkAbbr(currentNetwork);

  const { close } = usePopup(POPUP_ID.SWAP);
  const { slippage: slippageRaw } = useSlippageStore();

  const [selectedDetailInfo, selectDetailInfo] = useState<'TOKEN' | 'USD'>('TOKEN');

  const slippage = Number(slippageRaw || 0);
  const {
    fromToken,
    toToken,

    fromInput,
  } = useSwapStore();
  const numFromInput = Number(fromInput) || 0;

  const { data: poolVaultAmmData } = useGetPoolVaultAmmQuery(
    {
      params: {
        networkAbbr: currentNetworkAbbr,
        poolId: swapOptimizedPathPool?.poolId || '',
      },
    },
    {
      enabled: !!swapOptimizedPathPool && !!currentNetworkAbbr,
    }
  );
  const { poolVaultAmm } = poolVaultAmmData || {};
  const { vault } = poolVaultAmm || {};

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

  const fee = swapOptimizedPathPool?.trandingFees || 0;

  const toInput =
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

  const numToInput = Number(toInput) || 0;
  const swapRatio =
    fromInput && toInput
      ? numToInput / (numFromInput === 0 ? 0.0001 : numFromInput)
      : toTokenReserve - toTokenReserve * (fromTokenReserve / (fromTokenReserve + (1 - fee)));

  const {
    allow: allowFromToken,
    allowance: allowanceFromToken,
    isLoading: allowFromTokenLoading,
    isSuccess: allowFromTokenSuccess,
    refetch: refetchFromTokenAllowance,
  } = useApprove({
    amount: numFromInput,
    address: fromToken?.address || '',
    issuer: fromToken?.address || '',
    spender: vault || '',
    currency: fromToken?.currency || '',
    enabled: numFromInput > 0 && !isXrp,
  });

  const {
    allow: allowToToken,
    allowance: allowanceToToken,
    isLoading: allowToTokenLoading,
    isSuccess: allowToTokenSuccess,
    refetch: refetchToTokenAllowance,
  } = useApprove({
    amount: numToInput,
    address: toToken?.address || '',
    issuer: toToken?.address || '',
    spender: vault || '',
    currency: toToken?.currency || '',
    enabled: numToInput > 0 && isXrp,
  });

  const validAmount = numFromInput > 0 || numToInput > 0;
  const validAllowance = isXrp ? allowanceToToken : allowanceFromToken;

  const {
    txData,
    blockTimestamp,
    isLoading: swapLoading,
    isSuccess: swapSuccess,
    isError,
    swap,
  } = useSwap({
    id: swapOptimizedPathPool?.poolId || '',
    fromToken: fromToken,
    fromInput: numFromInput,
    toToken: toToken,
    toInput: numToInput,
    enabled: !!swapOptimizedPathPool?.poolId && validAllowance && validAmount,
  });

  const txDate = new Date(blockTimestamp ?? 0);
  const isSuccess = swapSuccess && !!txData;
  const isLoading = swapLoading || allowFromTokenLoading || allowToTokenLoading;

  const effectivePrice =
    fromToken && toToken && swapRatio
      ? `1 ${fromToken.symbol} = ${formatNumber(swapRatio, 6)} ${toToken.symbol}`
      : '';

  const fromTokenPrice =
    swapOptimizedPathPool?.compositions?.find(c => c.symbol === fromToken?.symbol)?.price || 0;
  const fromTokenValue = numFromInput * fromTokenPrice;
  const toTokenPrice =
    swapOptimizedPathPool?.compositions?.find(c => c.symbol === fromToken?.symbol)?.price || 0;
  const toTokenValue = numToInput * toTokenPrice;

  const currentValue = selectedDetailInfo === 'TOKEN' ? numToInput : toTokenValue;
  const currentUnit = selectedDetailInfo === 'TOKEN' ? toToken?.symbol || '' : 'USD';
  const totalAfterFee = (1 - (swapOptimizedPathPool?.trandingFees || 0.003)) * (currentValue || 0);

  const slippageText = (slippage * 100).toFixed(1);
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
    if (isSuccess) return t('Return to pool page');

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
    toToken?.symbol,
  ]);

  const handleButtonClick = async () => {
    if (isLoading) return;
    if (isSuccess) {
      close();
      navigate(
        `/pools/${getNetworkAbbr(swapOptimizedPathPool?.network)}/${swapOptimizedPathPool?.poolId}`
      );
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
    const txHash = isXrp ? txData?.hash : txData?.extrinsicId;
    const url = `${SCANNER_URL[currentNetwork]}/${isXrp ? 'transactions' : 'extrinsic'}/${txHash}`;

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
    if (isSuccess) {
      queryClient.invalidateQueries(['GET', 'POOL']);
      queryClient.invalidateQueries(['GET', 'XRPL']);
      refetchBalance?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, queryClient]);

  return (
    <Popup
      id={POPUP_ID.SWAP}
      title={isSuccess ? '' : t('Swap preview')}
      button={
        <ButtonWrapper onClick={() => handleButtonClick()}>
          <ButtonPrimaryLarge
            text={buttonText}
            isLoading={isLoading}
            buttonType={isSuccess ? 'outlined' : 'filled'}
            disabled={!fromToken || !toToken || isError}
          />
        </ButtonWrapper>
      }
    >
      <Wrapper style={{ gap: isSuccess ? 40 : 24 }}>
        {isSuccess && (
          <>
            <SuccessWrapper>
              <SuccessIconWrapper>
                <IconCheck width={40} height={40} />
              </SuccessIconWrapper>
              <SuccessTitle>{t('Swap confirmed!')}</SuccessTitle>
              <SuccessSubTitle>
                {t('swap-success-message', {
                  fromValue: fromInput,
                  fromToken: fromToken?.symbol,
                  toValue: totalAfterSlippage,
                  toToken: toToken?.symbol,
                })}
              </SuccessSubTitle>
            </SuccessWrapper>

            <List title={t(`Total swap`)}>
              <TokenList
                title={`${totalAfterSlippage} ${toToken?.symbol}`}
                description={`$${formatNumber(toTokenValue, 4)}`}
                image={toToken?.image}
                type="large"
                leftAlign
              />
            </List>
          </>
        )}
        {!isSuccess && (
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
              </DetailInfoWrapper>
            </DetailWrapper>
          </>
        )}
        {!isSuccess && (
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
  px-16 py-12 bg-neutral-15 rounded-8 flex flex-col gap-2
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
