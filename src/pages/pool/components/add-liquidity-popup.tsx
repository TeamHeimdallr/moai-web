import { Fragment, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import tw, { styled } from 'twin.macro';
import { parseUnits, toHex } from 'viem';
import { useQueryClient } from 'wagmi';

import { useUserAllTokenBalances } from '~/api/api-contract/balance/user-all-token-balances';
import { useAddLiquidity } from '~/api/api-contract/pool/add-liquiditiy';
import { useApprove } from '~/api/api-contract/token/approve';
import { useGetPoolVaultAmmQuery } from '~/api/api-server/pools/get-pool-vault-amm';

import { COLOR } from '~/assets/colors';
import { IconCancel, IconCheck, IconLink, IconTime } from '~/assets/icons';

import { SCANNER_URL } from '~/constants';

import { ButtonPrimaryLarge } from '~/components/buttons';
import { List } from '~/components/lists';
import { LoadingStep } from '~/components/loadings/step';
import { Popup } from '~/components/popup';
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
  useAddLiquidityNetworkFeeErrorStore,
  useApproveNetworkFeeErrorStore,
} from '~/states/contexts/network-fee-error/network-fee-error';
import { IPool, ITokenComposition, NETWORK, POPUP_ID } from '~/types';

interface Props {
  pool?: IPool;
  tokensIn?: (ITokenComposition & { balance: number; amount: number })[];

  lpTokenPrice: number;
  bptOut: number;
  priceImpact: string;

  refetchBalance?: () => void;
}
export const AddLiquidityPopup = ({
  tokensIn,
  pool,
  lpTokenPrice,
  bptOut,
  priceImpact,
  refetchBalance,
}: Props) => {
  const { error: addLiquidityGasError, setError: setAddLiquidityGasError } =
    useAddLiquidityNetworkFeeErrorStore();
  const { error: approveGasError, setError: setApproveGasError } = useApproveNetworkFeeErrorStore();

  const { userAllTokenBalances } = useUserAllTokenBalances();
  const xrp = userAllTokenBalances?.find(t => t.symbol === 'XRP');
  const xrpBalance = xrp?.balance || 0;

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { t } = useTranslation();

  const { isXrp, isEvm, isFpass } = useNetwork();
  const { network, poolId, lpToken } = pool || {};
  const networkAbbr = getNetworkAbbr(network);
  const { network: networkParam } = useParams();
  const { selectedNetwork } = useNetwork();

  const [estimatedAddLiquidityFee, setEstimatedAddLiquidityFee] = useState<number | undefined>();
  const [estimatedToken1ApproveFee, setEstimatedToken1ApproveFee] = useState<number | undefined>();
  const [estimatedToken2ApproveFee, setEstimatedToken2ApproveFee] = useState<number | undefined>();
  const [estimatedToken3ApproveFee, setEstimatedToken3ApproveFee] = useState<number | undefined>();

  const currentNetwork = getNetworkFull(networkParam) ?? selectedNetwork;

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

  const token1ApproveEnabled = token1Amount > 0 && !isXrp;
  const token2ApproveEnabled = token2Amount > 0 && !isXrp;
  const token3ApproveEnabled = bptOut > 0 && isXrp;

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
        if (allowance3) return await writeAsync?.();
        else await allowToken3();
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
      if (!isXrp) {
        if (!allowance1) return await allowToken1();
        if (!allowance2) return await allowToken2();
      }

      return await writeAsync?.();
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
      !((tokenLength === 2 && step === 3) || (tokenLength !== 2 && step === 2))
    )
      return;

    const estimateAddLiquidityFeeAsync = async () => {
      const fee = await estimateAddLiquidityFee?.();
      setEstimatedAddLiquidityFee(fee ?? 3.25);
    };
    estimateAddLiquidityFeeAsync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addLiquidityEnabled, tokenLength, step]);

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
  }, [step, isXrp, token1ApproveEnabled, token2ApproveEnabled, token3ApproveEnabled]);

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
    ? estimatedToken3ApproveFee || ''
    : estimatedAddLiquidityFee || '';

  // TODO change after fee proxy
  const validMaxXrpAmount =
    tokensIn?.[0]?.symbol === 'XRP'
      ? token1Amount + Number(estimatedFee || 3.25) < xrpBalance
      : tokensIn?.[1]?.symbol === 'XRP'
      ? token2Amount + Number(estimatedFee || 3.25) < xrpBalance
      : true;

  const gasError =
    xrpBalance <= Number(estimatedFee || 3.25) ||
    addLiquidityGasError ||
    approveGasError ||
    !validMaxXrpAmount;

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
            disabled={isIdle && gasError}
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
                  title={`${formatNumber(amount, 6)} ${symbol}`}
                  description={`$${formatNumber(amount * (price || 0), 4)}`}
                  image={image}
                  leftAlign
                />
                {idx !== tokenLength - 1 && <Divider />}
              </Fragment>
            ))}
          </List>
        )}
        {!isIdle && isSuccess && (
          <List title={t(`You're expected to receive`)}>
            <TokenList
              type="large"
              title={`${formatNumber(bptOut, 6)}`}
              subTitle={`${lpToken?.symbol || ''}`}
              description={`$${formatNumber(bptOut * lpTokenPrice, 6)}`}
              image={
                <Jazzicon
                  diameter={36}
                  seed={jsNumberForAddress(
                    isXrp ? toHex(lpToken?.address || '', { size: 42 }) : lpToken?.address || ''
                  )}
                />
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
                <SummaryText>{`$${formatNumber(bptOut * lpTokenPrice, 6)}`}</SummaryText>
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
                    {estimatedToken1ApproveFee ||
                    estimatedToken2ApproveFee ||
                    estimatedToken3ApproveFee ||
                    estimatedAddLiquidityFee
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

const Divider = tw.div`
  w-full h-1 flex-shrink-0 bg-neutral-20
`;

const Wrapper = tw.div`
  flex flex-col gap-24 px-24 py-0
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
