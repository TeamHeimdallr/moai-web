import { Fragment, Suspense, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import tw, { styled } from 'twin.macro';
import { formatUnits, parseUnits, toHex } from 'viem';

import { useUserAllTokenBalances } from '~/api/api-contract/balance/user-all-token-balances';
import { useWithdrawLiquidity } from '~/api/api-contract/pool/withdraw-liquidity';
import { useApprove } from '~/api/api-contract/token/approve';
import { useGetPoolVaultAmmQuery } from '~/api/api-server/pools/get-pool-vault-amm';

import { COLOR } from '~/assets/colors';
import { IconCancel, IconCheck, IconLink, IconTime } from '~/assets/icons';

import { SCANNER_URL } from '~/constants';

import { ButtonPrimaryLarge } from '~/components/buttons';
import { List } from '~/components/lists';
import { LoadingStep } from '~/components/loadings';
import { Popup } from '~/components/popup';
import { ListSkeleton } from '~/components/skeleton/list-skeleton';
import { SkeletonBase } from '~/components/skeleton/skeleton-base';
import { TokenList } from '~/components/token-list';

import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import {
  DATE_FORMATTER,
  formatNumber,
  getNetworkAbbr,
  getNetworkFull,
  getTokenDecimal,
} from '~/utils';
import {
  useApproveNetworkFeeErrorStore,
  useWithdrawLiquidityNetworkFeeErrorStore,
} from '~/states/contexts/network-fee-error/network-fee-error';
import { IPool, ITokenComposition, NETWORK, POPUP_ID } from '~/types';

interface Props {
  pool?: IPool;
  tokensOut?: (ITokenComposition & { amount: number })[];

  lpTokenPrice: number;
  bptIn: bigint;
  priceImpact: string;
  withdrawTokenWeight: number;

  refetchBalance?: () => void;
}

export const WithdrawLiquidityPopup = ({
  pool,
  tokensOut,

  lpTokenPrice,
  bptIn,
  priceImpact,
  withdrawTokenWeight,

  refetchBalance,
}: Props) => {
  return (
    <Suspense fallback={<_WithdrawLiquidityPopupSkeleton />}>
      <_WithdrawLiquidityPopup
        pool={pool}
        tokensOut={tokensOut}
        lpTokenPrice={lpTokenPrice}
        bptIn={bptIn}
        priceImpact={priceImpact}
        withdrawTokenWeight={withdrawTokenWeight}
        refetchBalance={refetchBalance}
      />
    </Suspense>
  );
};

const _WithdrawLiquidityPopup = ({
  pool,
  tokensOut,

  lpTokenPrice,
  bptIn,
  priceImpact,
  withdrawTokenWeight,

  refetchBalance,
}: Props) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { isXrp, isEvm, isFpass } = useNetwork();
  const { poolId, network, lpToken } = pool || {};

  const networkAbbr = getNetworkAbbr(network);
  const { t } = useTranslation();
  const { network: networkParam } = useParams();
  const { selectedNetwork } = useNetwork();

  const [estimatedWithdrawLiquidityFee, setEstimatedWithdrawLiquidityFee] = useState<
    number | undefined
  >();
  const [estimatedToken1ApproveFee, setEstimatedToken1ApproveFee] = useState<number | undefined>();
  const [estimatedToken2ApproveFee, setEstimatedToken2ApproveFee] = useState<number | undefined>();

  const currentNetwork = getNetworkFull(networkParam) ?? selectedNetwork;

  const { error: withdrawLiquidityGasError, setError: setWithdrawLiquidityGasError } =
    useWithdrawLiquidityNetworkFeeErrorStore();
  const { error: approveGasError, setError: setApproveGasError } = useApproveNetworkFeeErrorStore();

  const { userAllTokenBalances } = useUserAllTokenBalances();
  const xrp = userAllTokenBalances?.find(t => t.symbol === 'XRP');
  const xrpBalance = xrp?.balance || 0;

  const { close } = usePopup(POPUP_ID.WITHDRAW_LP);

  const { data: poolVaultAmmData } = useGetPoolVaultAmmQuery(
    {
      params: {
        networkAbbr: getNetworkAbbr(network),
        poolId: poolId || '',
      },
    },
    {
      enabled: !!network && !!poolId,
      cacheTime: Infinity,
      staleTime: Infinity,
    }
  );
  const { poolVaultAmm } = poolVaultAmmData || {};
  const { vault } = poolVaultAmm || {};

  const tokenLength = !isXrp ? 1 : tokensOut?.filter(t => t.amount > 0)?.length || 0;
  const token1Amount = tokensOut?.[0]?.amount || 0;
  const token2Amount = tokensOut?.[1]?.amount || 0;

  const token1ApproveEnabled = token1Amount > 0 && isXrp;
  const token2ApproveEnabled = token2Amount > 0 && isXrp;

  const {
    allow: allowToken1,
    allowance: allowance1,
    isLoading: allowLoading1,
    isSuccess: allowSuccess1,
    refetch: refetchAllowance1,
    estimateFee: estimateToken1ApproveFee,
  } = useApprove({
    amount: parseUnits(
      `${(token1Amount || 0).toFixed(18)}`,
      getTokenDecimal(currentNetwork, tokensOut?.[0]?.symbol || '')
    ),
    address: tokensOut?.[0]?.address || '',
    issuer: tokensOut?.[0]?.address || '',
    symbol: tokensOut?.[0]?.symbol || '',
    spender: vault || '',
    currency: tokensOut?.[0]?.currency || '',
    enabled: token1ApproveEnabled,
  });

  const {
    allow: allowToken2,
    allowance: allowance2,
    isLoading: allowLoading2,
    isSuccess: allowSuccess2,
    refetch: refetchAllowance2,
    estimateFee: estimateToken2ApproveFee,
  } = useApprove({
    amount: parseUnits(
      `${(token2Amount || 0).toFixed(18)}`,
      getTokenDecimal(currentNetwork, tokensOut?.[1]?.symbol || '')
    ),
    address: tokensOut?.[1]?.address || '',
    issuer: tokensOut?.[1]?.address || '',
    symbol: tokensOut?.[1]?.symbol || '',
    spender: vault || '',
    currency: tokensOut?.[1]?.currency || '',
    enabled: token2ApproveEnabled,
  });

  const validAmount = token1Amount > 0 || token2Amount > 0;
  const getValidAllowance = () => {
    if (!isXrp) return true;
    if (token1Amount > 0 && token2Amount > 0) return allowance1 && allowance2;
    if (token1Amount > 0) return allowance1;
    if (token2Amount > 0) return allowance2;
  };

  const withdrawLiquidityEnabled = !!poolId && validAmount && getValidAllowance();
  const {
    isLoading: withdrawLiquidityLoading,
    isSuccess: withdrawLiquiditySuccess,
    txData,
    writeAsync,
    blockTimestamp,
    estimateFee: estimateWithdrawLiquidityFee,
  } = useWithdrawLiquidity({
    id: poolId || '',
    tokens: tokensOut || [],
    // input value
    bptIn,
    enabled: withdrawLiquidityEnabled,
  });

  const txDate = new Date(blockTimestamp || 0);
  const isIdle = !txData;
  const isSuccess = withdrawLiquiditySuccess && !!txData;
  const isLoading = withdrawLiquidityLoading || allowLoading1 || allowLoading2;
  const totalValue = Number(formatUnits(bptIn || 0n, 18)) * lpTokenPrice;

  const step = useMemo(() => {
    if (isSuccess) return tokenLength + 1;

    // single token deposit or in xrpl case (getting approve for receiving token)
    if (tokenLength === 1) {
      if (!isXrp) {
        return 2;
      } else {
        if (token1Amount > 0 && token2Amount <= 0) {
          if (allowance1) return 2;
        }
        if (token2Amount > 0 && token1Amount <= 0) {
          if (allowance2) return 2;
        }
      }
    }

    if (tokenLength === 2) {
      if (isXrp) {
        if (!allowance1) return 1;
        if (!allowance2) return 2;
      } else {
        return 3;
      }
      return 3;
    }

    return 1;
  }, [allowance1, allowance2, isSuccess, isXrp, token1Amount, token2Amount, tokenLength]);

  const stepLoading = useMemo(() => {
    if (tokenLength === 1) {
      if (!isXrp) {
        if (step === 2) return withdrawLiquidityLoading;
      } else {
        if (token1Amount > 0 && token2Amount <= 0) {
          if (step === 1) return allowLoading1;
          if (step === 2) return withdrawLiquidityLoading;
        }
        if (token2Amount > 0 && token1Amount <= 0) {
          if (step === 1) return allowLoading2;
          if (step === 2) return withdrawLiquidityLoading;
        }
      }
    }

    if (tokenLength === 2) {
      if (isXrp) {
        if (step === 1) return allowLoading1;
        if (step === 2) return allowLoading2;
        if (step === 3) return withdrawLiquidityLoading;
      } else {
        return withdrawLiquidityLoading;
      }
    }

    return false;
  }, [
    withdrawLiquidityLoading,
    allowLoading1,
    allowLoading2,
    isXrp,
    step,
    token1Amount,
    token2Amount,
    tokenLength,
  ]);

  const buttonText = useMemo(() => {
    if (!isIdle) {
      if (isSuccess) return t('Return to pool page');
      return t('Try again');
    }
    // single token deposit
    if (tokenLength === 1) {
      if (!isXrp) {
        return t('Confirm withdraw liquidity in wallet');
      } else {
        if (token1Amount > 0 && token2Amount <= 0) {
          if (!allowance1)
            return t('approve-withdraw-liquidity-token-message', { token: tokensOut?.[0]?.symbol });
          return t('Confirm withdraw liquidity in wallet');
        }
        if (token2Amount > 0 && token1Amount <= 0) {
          if (!allowance2)
            return t('approve-withdraw-liquidity-token-message', {
              token: tokensOut?.[1]?.symbol,
            });
          return t('Confirm withdraw liquidity in wallet');
        }
      }
    }

    if (tokenLength === 2) {
      if (isXrp) {
        if (!allowance1)
          return t('approve-withdraw-liquidity-token-message', {
            token: tokensOut?.[0]?.symbol,
          });
        if (!allowance2)
          return t('approve-withdraw-liquidity-token-message', {
            token: tokensOut?.[1]?.symbol,
          });
      }
      return t('Confirm withdraw liquidity in wallet');
    }

    return '';
  }, [
    allowance1,
    allowance2,
    isSuccess,
    isXrp,
    isIdle,
    t,
    token1Amount,
    token2Amount,
    tokenLength,
    tokensOut,
  ]);

  const handleButtonClick = async () => {
    if (isLoading) return;
    if (!isIdle) {
      if (isSuccess) {
        close();
        navigate(`/pools/${networkAbbr}/${poolId}`);
        return;
      }
      close();
      return;
    }

    // single token deposit
    if (tokenLength === 1) {
      if (!isXrp) {
        return await writeAsync?.();
      } else {
        if (token1Amount > 0 && token2Amount <= 0) {
          if (allowance1) return await writeAsync?.();
          else await allowToken1();
        }
        if (token2Amount > 0 && token1Amount <= 0) {
          if (allowance2) return await writeAsync?.();
          else await allowToken2();
        }
      }
    }

    // 2 token deposit
    if (tokenLength === 2) {
      if (isXrp) {
        if (!allowance1) return await allowToken1();
        if (!allowance2) return await allowToken2();
      }

      return await writeAsync?.();
    }
  };

  const handleLink = () => {
    const txHash = isFpass ? txData?.extrinsicId : isEvm ? txData?.transactionHash : txData?.hash;
    const url = `${SCANNER_URL[currentNetwork || NETWORK.THE_ROOT_NETWORK]}/${
      isFpass ? 'extrinsic' : isEvm ? 'tx' : 'transactions'
    }/${txHash}`;

    window.open(url);
  };

  useEffect(() => {
    if (allowSuccess1) refetchAllowance1();
    if (allowSuccess2) refetchAllowance2();
  }, [allowSuccess1, allowSuccess2, refetchAllowance1, refetchAllowance2]);

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
      setWithdrawLiquidityGasError(false);
      setApproveGasError(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      !estimateWithdrawLiquidityFee ||
      !withdrawLiquidityEnabled ||
      (isXrp && (!allowance1 || !allowance2))
    )
      return;

    const estimateWithdrawLiquidityFeeAsync = async () => {
      const fee = await estimateWithdrawLiquidityFee?.();
      setEstimatedWithdrawLiquidityFee(fee ?? 4.2);
    };
    estimateWithdrawLiquidityFeeAsync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withdrawLiquidityEnabled, tokenLength, isXrp, allowance1, allowance2]);

  useEffect(() => {
    if (!isXrp) return;

    const estimateApproveFeeAsync = async (n: number) => {
      if (n === 1) {
        const fee = await estimateToken1ApproveFee?.();
        setEstimatedToken1ApproveFee(fee ?? 1.5);
      } else if (n === 2) {
        const fee = await estimateToken2ApproveFee?.();
        setEstimatedToken2ApproveFee(fee ?? 1.5);
      }
    };

    // single token withdraw
    if (tokenLength === 1) {
      if (token1Amount > 0 && token2Amount <= 0) {
        if (step === 1 && token1ApproveEnabled) {
          // allow token 1
          estimateApproveFeeAsync(1);
        }
      }
      if (token2Amount > 0 && token1Amount <= 0) {
        if (step === 1 && token2ApproveEnabled) {
          // allow token 2
          estimateApproveFeeAsync(2);
        }
      }
    }

    // 2 token withdraw
    if (tokenLength === 2) {
      if (step === 1 && token1ApproveEnabled) {
        // allow token 1
        estimateApproveFeeAsync(1);
      } else if (step === 2 && token2ApproveEnabled) {
        // allow token 2
        estimateApproveFeeAsync(2);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, isXrp, token1ApproveEnabled, token2ApproveEnabled]);

  const estimatedFee = isXrp
    ? tokenLength === 1
      ? token1Amount > 0 && token2Amount <= 0 && step === 1
        ? estimatedToken1ApproveFee || ''
        : token2Amount > 0 && token1Amount <= 0 && step == 1
        ? estimatedToken2ApproveFee || ''
        : estimatedWithdrawLiquidityFee || ''
      : step === 1
      ? estimatedToken1ApproveFee || ''
      : step === 2
      ? estimatedToken2ApproveFee || ''
      : estimatedWithdrawLiquidityFee || ''
    : estimatedWithdrawLiquidityFee || '';

  const gasError =
    xrpBalance <= Number(estimatedFee || 4.2) || withdrawLiquidityGasError || approveGasError;

  return (
    <Popup
      id={POPUP_ID.WITHDRAW_LP}
      title={isIdle ? t('Withdrawal preview') : ''}
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
            <SuccessTitle>{t('Swap failed')}</SuccessTitle>
            <SuccessSubTitle>{t('swap-fail-message')}</SuccessSubTitle>
          </FailedWrapper>
        )}
        {isIdle && (
          <List title={t(`You're providing`)}>
            <TokenList
              type="large"
              title={`${formatNumber(Number(formatUnits(bptIn || 0n, 18)), 6)} ${lpToken?.symbol}`}
              description={`$${formatNumber(totalValue)} (${withdrawTokenWeight.toFixed(4)}%)`}
              image={
                <Jazzicon
                  diameter={36}
                  seed={jsNumberForAddress(
                    isXrp ? toHex(lpToken?.address || '', { size: 42 }) : lpToken?.address || ''
                  )}
                />
              }
              leftAlign
            />
          </List>
        )}
        {!isIdle && isSuccess && (
          <List title={t(`You're expected to receive`)}>
            {tokensOut?.map(({ symbol, currentWeight, amount, image, price }, i) => (
              <Fragment key={`${symbol}-${i}`}>
                <TokenList
                  type="large"
                  title={`${amount.toFixed(6)} ${symbol}`}
                  description={`$${formatNumber(amount * (price || 0))} (${(
                    (currentWeight || 0) * 100
                  )?.toFixed(2)}%)`}
                  image={image}
                  leftAlign
                />
                {i !== (tokensOut?.length || 0) - 1 && <Divider />}
              </Fragment>
            ))}
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
              <Summary>
                <SummaryTextTitle>{t('Price impact')}</SummaryTextTitle>
                <SummaryText>{priceImpact}%</SummaryText>
              </Summary>
              <Divider />
              <GasFeeWrapper>
                <GasFeeInnerWrapper>
                  <GasFeeTitle>{t(`Gas fee`)}</GasFeeTitle>
                  <GasFeeTitleValue>
                    {estimatedFee ? `~${formatNumber(estimatedFee)} XRP` : 'calculating...'}
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

            <LoadingStep
              totalSteps={tokenLength + 1}
              step={step}
              isLoading={stepLoading}
              isDone={isSuccess}
            />
          </>
        )}
      </Wrapper>
    </Popup>
  );
};

const _WithdrawLiquidityPopupSkeleton = () => {
  const { t } = useTranslation();
  return (
    <Popup id={POPUP_ID.WITHDRAW_LP} title={t('Withdrawal preview')}>
      <Wrapper>
        <ListSkeleton height={114} title={t("You're providing")} />
        <ListSkeleton height={183} title={t("You're expected to receive")} />
        <ListSkeleton height={122} title={t('Summary')} />
        <SkeletonBase height={48} />
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
