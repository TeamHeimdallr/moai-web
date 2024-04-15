import { Fragment, Suspense, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import tw, { css, styled } from 'twin.macro';
import { parseUnits } from 'viem';
import { useQueryClient } from 'wagmi';

import { useUserFeeTokenBalance } from '~/api/api-contract/balance/user-fee-token-balance';
import { useAddLiquidity } from '~/api/api-contract/pool/add-liquiditiy';
import { useApprove } from '~/api/api-contract/token/approve';
import { useGetPoolVaultAmmQuery } from '~/api/api-server/pools/get-pool-vault-amm';

import { COLOR } from '~/assets/colors';
import { IconCancel, IconCheck, IconLink, IconTime } from '~/assets/icons';

import { ASSET_URL, ROOT_ASSET_ID, SCANNER_URL, THOUSAND } from '~/constants';

import { ButtonPrimaryLarge } from '~/components/buttons';
import { FeeProxySelector } from '~/components/fee-proxy-selector';
import { List } from '~/components/lists';
import { LoadingStep } from '~/components/loadings/step';
import { Popup } from '~/components/popup';
import { ListSkeleton } from '~/components/skeleton/list-skeleton';
import { SkeletonBase } from '~/components/skeleton/skeleton-base';
import { TokenList } from '~/components/token-list';

import { useGAAction } from '~/hooks/analaystics/ga-action';
import { useGAInView } from '~/hooks/analaystics/ga-in-view';
import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useMediaQuery } from '~/hooks/utils';
import {
  DATE_FORMATTER,
  formatNumber,
  getNetworkAbbr,
  getNetworkFull,
  getTokenDecimal,
} from '~/utils';
import {
  useAddLiquidityNetworkFeeErrorStore,
  useApproveNetworkFeeErrorStore,
} from '~/states/contexts/network-fee-error/network-fee-error';
import { useFeeTokenStore } from '~/states/data/fee-proxy';
import { IPool, ITokenComposition, NETWORK, POPUP_ID } from '~/types';

interface Props {
  pool?: IPool;
  tokensIn?: (ITokenComposition & { balance: number; amount: number })[];

  lpTokenPrice: number;
  bptOut: number;
  priceImpact: string;

  refetchBalance?: () => void;
  handleSuccess?: (hash: string) => void;
}

export const AddLiquidityPopup = ({
  tokensIn,
  pool,
  lpTokenPrice,
  bptOut,
  priceImpact,
  refetchBalance,
  handleSuccess,
}: Props) => {
  return (
    <Suspense fallback={<_AddLiquidityPopupSkeleton />}>
      <_AddLiquidityPopup
        tokensIn={tokensIn}
        pool={pool}
        lpTokenPrice={lpTokenPrice}
        bptOut={bptOut}
        priceImpact={priceImpact}
        refetchBalance={refetchBalance}
        handleSuccess={handleSuccess}
      />
    </Suspense>
  );
};

const _AddLiquidityPopup = ({
  tokensIn,
  pool,
  lpTokenPrice,
  bptOut,
  priceImpact,
  refetchBalance,
  handleSuccess,
}: Props) => {
  const { ref } = useGAInView({ name: 'add-liquidity-popup' });
  const { gaAction } = useGAAction();

  const { error: addLiquidityGasError, setError: setAddLiquidityGasError } =
    useAddLiquidityNetworkFeeErrorStore();
  const { error: approveGasError, setError: setApproveGasError } = useApproveNetworkFeeErrorStore();

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { t } = useTranslation();

  const { isXrp, isEvm, isFpass } = useNetwork();
  const { network, poolId, lpToken } = pool || {};
  const networkAbbr = getNetworkAbbr(network);
  const { network: networkParam } = useParams();
  const { selectedNetwork } = useNetwork();
  const { isMD } = useMediaQuery();

  const { userFeeTokenBalanace: userFeeToken } = useUserFeeTokenBalance();
  const userFeeTokenBalance = userFeeToken?.balance || 0;
  const { feeToken, setFeeToken, isNativeFee } = useFeeTokenStore();

  const [estimatedAddLiquidityFee, setEstimatedAddLiquidityFee] = useState<number | undefined>();
  const [estimatedToken1ApproveFee, setEstimatedToken1ApproveFee] = useState<number | undefined>();
  const [estimatedToken2ApproveFee, setEstimatedToken2ApproveFee] = useState<number | undefined>();
  const [estimatedToken3ApproveFee, setEstimatedToken3ApproveFee] = useState<number | undefined>();

  const currentNetwork = getNetworkFull(networkParam) ?? selectedNetwork;
  const isRoot = currentNetwork === NETWORK.THE_ROOT_NETWORK;

  const { close } = usePopup(POPUP_ID.ADD_LP);

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

  const tokenLength = isXrp ? 1 : tokensIn?.filter(t => t.amount > 0)?.length || 0;
  const token1Amount = tokensIn?.[0]?.amount || 0;
  const token2Amount = tokensIn?.[1]?.amount || 0;
  const totalAmount =
    tokensIn?.reduce((acc, cur) => acc + (cur.amount || 0) * (cur.price || 0), 0) || 0;

  const token1ApproveEnabled = token1Amount > 0 && !isXrp;
  const token2ApproveEnabled = token2Amount > 0 && !isXrp;
  const token3ApproveEnabled = isXrp;

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
      getTokenDecimal(currentNetwork, tokensIn?.[0]?.symbol || '')
    ),
    symbol: tokensIn?.[0]?.symbol || '',
    address: tokensIn?.[0]?.address || '',
    issuer: tokensIn?.[0]?.address || '',
    spender: vault || '',
    currency: tokensIn?.[0]?.currency || '',
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
      getTokenDecimal(currentNetwork, tokensIn?.[1]?.symbol || '')
    ),
    symbol: tokensIn?.[1]?.symbol || '',
    address: tokensIn?.[1]?.address || '',
    issuer: tokensIn?.[1]?.address || '',
    spender: vault || '',
    currency: tokensIn?.[1]?.currency || '',
    enabled: token2ApproveEnabled,
  });

  const {
    allow: allowToken3,
    allowance: allowance3,
    isLoading: allowLoading3,
    isSuccess: allowSuccess3,
    refetch: refetchAllowance3,
    estimateFee: estimateToken3ApproveFee,
  } = useApprove({
    amount: parseUnits(
      `${(bptOut || 0).toFixed(18)}`,
      getTokenDecimal(currentNetwork, lpToken?.symbol || '')
    ),
    symbol: lpToken?.symbol || '',
    address: lpToken?.address || '',
    issuer: lpToken?.address || '',
    spender: vault || '',
    currency: lpToken?.currency || '',
    enabled: token3ApproveEnabled,
  });

  const validAmount = token1Amount > 0 || token2Amount > 0;
  const getValidAllowance = () => {
    if (isXrp) return allowance3;
    if (token1Amount > 0 && token2Amount > 0) return allowance1 && allowance2;
    if (token1Amount > 0) return allowance1;
    if (token2Amount > 0) return allowance2;
  };

  const addLiquidityEnabled = !!poolId && validAmount && getValidAllowance();
  const {
    isLoading: addLiquidityLoading,
    isSuccess: addLiquiditySuccess,
    txData,
    blockTimestamp,
    writeAsync,
    estimateFee: estimateAddLiquidityFee,
  } = useAddLiquidity({
    id: poolId || '',
    tokens: tokensIn || [],
    enabled: addLiquidityEnabled,
  });

  const txDate = new Date(blockTimestamp || 0);
  const isIdle = !txData;
  const isSuccess = addLiquiditySuccess && !!txData;
  const isLoading = addLiquidityLoading || allowLoading1 || allowLoading2;

  const step = useMemo(() => {
    if (isSuccess) return tokenLength + 1;

    // single token deposit or in xrpl case (getting approve for receiving token)
    if (tokenLength === 1) {
      if (isXrp) {
        if (allowance3) return 2;
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
      if (!isXrp) {
        if (!allowance1) return 1;
        if (!allowance2) return 2;
      } else {
        return 3;
      }
      return 3;
    }

    return 1;
  }, [
    allowance1,
    allowance2,
    allowance3,
    isSuccess,
    isXrp,
    token1Amount,
    token2Amount,
    tokenLength,
  ]);

  const stepLoading = useMemo(() => {
    if (tokenLength === 1) {
      if (isXrp) {
        if (step === 1) return allowLoading3;
        if (step === 2) return addLiquidityLoading;
      } else {
        if (token1Amount > 0 && token2Amount <= 0) {
          if (step === 1) return allowLoading1;
          if (step === 2) return addLiquidityLoading;
        }
        if (token2Amount > 0 && token1Amount <= 0) {
          if (step === 1) return allowLoading2;
          if (step === 2) return addLiquidityLoading;
        }
      }
    }

    if (tokenLength === 2) {
      if (!isXrp) {
        if (step === 1) return allowLoading1;
        if (step === 2) return allowLoading2;
        if (step === 3) return addLiquidityLoading;
      } else {
        if (step === 1) return allowLoading3;
        if (step === 2) return addLiquidityLoading;
      }
    }

    return false;
  }, [
    addLiquidityLoading,
    allowLoading1,
    allowLoading2,
    allowLoading3,
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
      if (isXrp) {
        if (!allowance3)
          return t('approve-add-liquidity-token-message', { token: lpToken?.symbol });
        return t('Confirm add liquidity in wallet');
      } else {
        if (token1Amount > 0 && token2Amount <= 0) {
          if (!allowance1)
            return t('approve-add-liquidity-token-message', { token: tokensIn?.[0]?.symbol });
          return t('Confirm add liquidity in wallet');
        }
        if (token2Amount > 0 && token1Amount <= 0) {
          if (!allowance2)
            return t('approve-add-liquidity-token-message', { token: tokensIn?.[1]?.symbol });
          return t('Confirm add liquidity in wallet');
        }
      }
    }

    if (tokenLength === 2) {
      if (!isXrp) {
        if (!allowance1)
          return t('approve-add-liquidity-token-message', { token: tokensIn?.[0]?.symbol });
        if (!allowance2)
          return t('approve-add-liquidity-token-message', { token: tokensIn?.[1]?.symbol });
      }

      return t('Confirm add liquidity in wallet');
    }

    return '';
  }, [
    allowance1,
    allowance2,
    allowance3,
    isSuccess,
    isXrp,
    isIdle,
    lpToken?.symbol,
    t,
    token1Amount,
    token2Amount,
    tokenLength,
    tokensIn,
  ]);

  const handleButtonClick = async () => {
    if (isLoading) return;
    if (!isIdle) {
      if (isSuccess) {
        gaAction({
          action: 'go-to-pool-page',
          data: { component: 'add-liquidity-popup', link: `pools/${networkAbbr}/${poolId}` },
        });

        close();
        navigate(`/pools/${networkAbbr}/${poolId}`);
        return;
      }
      close();
      return;
    }
    // single token deposit
    if (tokenLength === 1) {
      if (isXrp) {
        if (allowance3) {
          await writeAsync?.();
          gaAction({
            action: 'add-liquidity',
            data: {
              isXrp,
              component: 'add-liquidity-popup',
              token1Amount,
              token2Amount,
              userFeeTokenBalance,
              estimatedAddLiquidityFee,
              bptOut,
            },
          });
          return;
        } else {
          gaAction({
            action: 'approve-token',
            data: {
              isXrp,
              symbol: lpToken?.symbol,
              component: 'add-liquidity-popup',
              token1Amount,
              token2Amount,
              userFeeTokenBalance,
              estimatedToken3ApproveFee,
              bptOut,
            },
          });
          await allowToken3();
        }
      } else {
        if (token1Amount > 0 && token2Amount <= 0) {
          if (allowance1) {
            gaAction({
              action: 'add-liquidity',
              data: {
                isXrp,
                component: 'add-liquidity-popup',
                token1Amount,
                token2Amount,
                userFeeTokenBalance,
                estimatedAddLiquidityFee,
                bptOut,
              },
            });
            return await writeAsync?.();
          } else {
            gaAction({
              action: 'approve-token',
              data: {
                isXrp,
                symbol: tokensIn?.[0]?.symbol,
                component: 'add-liquidity-popup',
                token1Amount,
                token2Amount,
                userFeeTokenBalance,
                estimatedToken1ApproveFee,
                bptOut,
              },
            });
            await allowToken1();
          }
        }
        if (token2Amount > 0 && token1Amount <= 0) {
          if (allowance2) {
            await writeAsync?.();
            gaAction({
              action: 'add-liquidity',
              data: {
                isXrp,
                component: 'add-liquidity-popup',
                token1Amount,
                token2Amount,
                userFeeTokenBalance,
                estimatedAddLiquidityFee,
                bptOut,
              },
            });
            return;
          } else {
            gaAction({
              action: 'approve-token',
              data: {
                isXrp,
                symbol: tokensIn?.[1]?.symbol,
                component: 'add-liquidity-popup',
                token1Amount,
                token2Amount,
                userFeeTokenBalance,
                estimatedToken2ApproveFee,
                bptOut,
              },
            });
            await allowToken2();
          }
        }
      }
    }

    // 2 token deposit
    if (tokenLength === 2) {
      if (!isXrp) {
        if (!allowance1) {
          gaAction({
            action: 'approve-token',
            data: {
              isXrp,
              symbol: tokensIn?.[0]?.symbol,
              component: 'add-liquidity-popup',
              token1Amount,
              token2Amount,
              userFeeTokenBalance,
              estimatedAddLiquidityFee,
              bptOut,
            },
          });
          return await allowToken1();
        }
        if (!allowance2) {
          gaAction({
            action: 'approve-token',
            data: {
              isXrp,
              symbol: tokensIn?.[1]?.symbol,
              component: 'add-liquidity-popup',
              token1Amount,
              token2Amount,
              userFeeTokenBalance,
              estimatedAddLiquidityFee,
              bptOut,
            },
          });
          return await allowToken2();
        }
      }

      await writeAsync?.();
      gaAction({
        action: 'add-liquidity',
        data: {
          isXrp,
          component: 'add-liquidity-popup',
          token1Amount,
          token2Amount,
          userFeeTokenBalance,
          estimatedAddLiquidityFee,
          bptOut,
        },
      });
    }
  };

  const handleLink = () => {
    const txHash = isFpass ? txData?.extrinsicId : isEvm ? txData?.transactionHash : txData?.hash;
    const url = `${SCANNER_URL[currentNetwork || NETWORK.THE_ROOT_NETWORK]}/${
      isFpass ? 'extrinsics' : isEvm ? 'tx' : 'transactions'
    }/${txHash}`;

    gaAction({
      action: 'go-to-transaction',
      data: { component: 'add-liquidity-popup', txHash: txHash, link: url },
    });

    window.open(url);
  };

  useEffect(() => {
    if (isSuccess && txData?.hash) handleSuccess?.(txData.hash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, txData?.hash]);

  useEffect(() => {
    if (allowSuccess1) refetchAllowance1();
    if (allowSuccess2) refetchAllowance2();
    if (allowSuccess3) refetchAllowance3();
  }, [
    allowSuccess1,
    allowSuccess2,
    allowSuccess3,
    refetchAllowance1,
    refetchAllowance2,
    refetchAllowance3,
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
      setAddLiquidityGasError(false);
      setApproveGasError(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      !addLiquidityEnabled ||
      !((tokenLength === 2 && step === 3) || (tokenLength !== 2 && step === 2)) ||
      !estimateAddLiquidityFee
    )
      return;

    setEstimatedAddLiquidityFee(0);
    const estimateAddLiquidityFeeAsync = async () => {
      const fee = await estimateAddLiquidityFee?.();
      setEstimatedAddLiquidityFee(fee ?? 4.6);
    };
    estimateAddLiquidityFeeAsync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addLiquidityEnabled, tokenLength, step, feeToken]);

  useEffect(() => {
    const estimateApproveFeeAsync = async (n: number) => {
      if (n === 1) {
        const fee = await estimateToken1ApproveFee?.();
        setEstimatedToken1ApproveFee(fee ?? 1.5);
      } else if (n === 2) {
        const fee = await estimateToken2ApproveFee?.();
        setEstimatedToken2ApproveFee(fee ?? 1.5);
      } else if (n === 3) {
        const fee = await estimateToken3ApproveFee?.();
        setEstimatedToken3ApproveFee(fee ?? 1.5);
      }
    };

    // single token deposit
    if (tokenLength === 1) {
      if (isXrp) {
        if (step === 1 && token3ApproveEnabled) {
          // allow token 3
          estimateApproveFeeAsync(3);
        }
      } else {
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
    }

    // 2 token deposit
    if (tokenLength === 2) {
      if (!isXrp) {
        if (step === 1 && token1ApproveEnabled) {
          // allow token 1
          estimateApproveFeeAsync(1);
        } else if (step === 2 && token2ApproveEnabled) {
          // allow token 2
          estimateApproveFeeAsync(2);
        }
      } else {
        if (step === 1 && token3ApproveEnabled) {
          // allow token 3
          estimateApproveFeeAsync(3);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, isXrp, token1ApproveEnabled, token2ApproveEnabled, token3ApproveEnabled, feeToken]);

  useEffect(() => {
    setFeeToken({
      name: 'XRP',
      assetId: ROOT_ASSET_ID.XRP,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNetwork]);

  const estimatedFee = !isXrp
    ? tokenLength === 1
      ? token1Amount > 0 && token2Amount <= 0 && step === 1
        ? estimatedToken1ApproveFee || ''
        : token2Amount > 0 && token1Amount <= 0 && step == 1
        ? estimatedToken2ApproveFee || ''
        : estimatedAddLiquidityFee || ''
      : step === 1
      ? estimatedToken1ApproveFee || ''
      : step === 2
      ? estimatedToken2ApproveFee || ''
      : estimatedAddLiquidityFee || ''
    : step === 1
    ? 0.0001
    : 0.0001;

  const validMaxFeeTokenAmount =
    tokensIn?.[0]?.symbol === feeToken.name
      ? token1Amount + Number(estimatedFee || 4.6) < userFeeTokenBalance
      : tokensIn?.[1]?.symbol === feeToken.name
      ? token2Amount + Number(estimatedFee || 4.6) < userFeeTokenBalance
      : true;

  const gasError =
    userFeeTokenBalance <= Number(estimatedFee || 4.6) ||
    addLiquidityGasError ||
    approveGasError ||
    !validMaxFeeTokenAmount;

  return (
    <Popup
      id={POPUP_ID.ADD_LP}
      title={isIdle ? t('Add liquidity preview') : ''}
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
      setting={isRoot && isFpass && isIdle && <FeeProxySelector />}
    >
      <Wrapper style={{ gap: isIdle ? (isMD ? 24 : 20) : 40 }} ref={ref}>
        {!isIdle && isSuccess && (
          <SuccessWrapper>
            <IconWrapper>
              <IconCheck width={40} height={40} />
            </IconWrapper>
            <SuccessTitle>{t('Add liquidity confirmed!')}</SuccessTitle>
            <SuccessSubTitle>
              {t('add-liquidity-success-message', { pool: lpToken?.symbol })}
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
            {tokensIn?.map(({ symbol, image, amount, price }, idx) => (
              <Fragment key={`${symbol}-${idx}`}>
                <TokenList
                  type="large"
                  title={`${formatNumber(amount, 6, 'floor', THOUSAND, 0)} ${symbol}`}
                  description={`$${formatNumber(amount * (price || 0))}`}
                  image={image || `${ASSET_URL}/tokens/token-unknown.png`}
                  leftAlign
                />
                {idx !== tokensIn.length - 1 && <Divider />}
              </Fragment>
            ))}
          </List>
        )}
        {(isIdle || isSuccess) && (
          <List title={t(`You're expected to receive`)}>
            <TokenList
              type="large"
              title={`${formatNumber(bptOut, 4, 'floor', THOUSAND, 0)}`}
              subTitle={`${lpToken?.symbol || ''}`}
              description={lpTokenPrice ? `$${formatNumber(bptOut * lpTokenPrice)}` : undefined}
              image={
                <LpWrapper images={[tokensIn?.[0]?.image, tokensIn?.[1]?.image]}>
                  <div />
                  <div />
                </LpWrapper>
              }
              leftAlign={true}
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
                <SummaryTextTitle>{t('Total liquidity')}</SummaryTextTitle>
                <SummaryText>{`$${formatNumber(totalAmount)}`}</SummaryText>
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
                    {estimatedFee
                      ? `~${formatNumber(estimatedFee, 6, 'floor', THOUSAND, 0)} ${feeToken.name}`
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

const _AddLiquidityPopupSkeleton = () => {
  const { t } = useTranslation();
  const { isSMD } = useMediaQuery();
  return (
    <Popup id={POPUP_ID.ADD_LP} title={t('Add liquidity preview')}>
      <Wrapper>
        <ListSkeleton title={t('You’re providing')} height={191} />
        <ListSkeleton title={t('You’re expected to receive')} height={118} />
        <ListSkeleton title={t('Summary')} height={isSMD ? 126 : 183} />
        <SkeletonBase height={48} />
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
interface LpWrapperProps {
  images: (string | undefined)[];
}
const LpWrapper = styled.div<LpWrapperProps>(({ images }) => [
  tw`relative w-64 h-36`,
  css`
    & > div {
      width: 36px;
      height: 36px;

      border-radius: 100%;

      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    }
    & > div:first-of-type {
      position: absolute;
      top: 0;
      left: 0;
      background-image: url(${images[0] || `${ASSET_URL}/tokens/token-unknown.png`});
    }
    & > div:last-of-type {
      position: absolute;
      top: 0;
      right: 0;
      z-index: 1;
      background-image: url(${images[1] || `${ASSET_URL}/tokens/token-unknown.png`});
    }
  `,
]);
