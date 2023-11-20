import { Fragment, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import tw from 'twin.macro';
import { parseUnits, toHex } from 'viem';

import { useWithdrawLiquidity } from '~/api/api-contract/pool/withdraw-liquidity';
import { useApprove } from '~/api/api-contract/token/approve';
import { useGetPoolVaultAmmQuery } from '~/api/api-server/pools/get-pool-vault-amm';

import { COLOR } from '~/assets/colors';
import { IconCheck, IconLink, IconTime } from '~/assets/icons';

import { SCANNER_URL, TOKEN_DECIMAL_WITHDRAW_LP } from '~/constants';

import { ButtonPrimaryLarge } from '~/components/buttons';
import { List } from '~/components/lists';
import { LoadingStep } from '~/components/loadings';
import { Popup } from '~/components/popup';
import { TokenList } from '~/components/token-list';

import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { DATE_FORMATTER, formatNumber, getNetworkAbbr } from '~/utils';
import { IPool, ITokenComposition, NETWORK, POPUP_ID } from '~/types';

interface Props {
  pool?: IPool;
  tokensOut?: (ITokenComposition & { amount: number })[];

  lpTokenPrice: number;
  bptIn: number;
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
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { isXrp } = useNetwork();
  const { poolId, network, lpToken } = pool || {};

  const networkAbbr = getNetworkAbbr(network);
  const { t } = useTranslation();

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

  const {
    allow: allowToken1,
    allowance: allowance1,
    isLoading: allowLoading1,
    isSuccess: allowSuccess1,
    refetch: refetchAllowance1,
  } = useApprove({
    amount: token1Amount,
    address: tokensOut?.[0]?.address || '',
    issuer: tokensOut?.[0]?.address || '',
    spender: vault || '',
    currency: tokensOut?.[0]?.currency || '',
    enabled: token1Amount > 0 && isXrp,
  });

  const {
    allow: allowToken2,
    allowance: allowance2,
    isLoading: allowLoading2,
    isSuccess: allowSuccess2,
    refetch: refetchAllowance2,
  } = useApprove({
    amount: token2Amount,
    address: tokensOut?.[1]?.address || '',
    issuer: tokensOut?.[1]?.address || '',
    spender: vault || '',
    currency: tokensOut?.[1]?.currency || '',
    enabled: token2Amount > 0 && isXrp,
  });

  const {
    allow: allowToken3,
    allowance: allowance3,
    isLoading: allowLoading3,
    isSuccess: allowSuccess3,
    refetch: refetchAllowance3,
  } = useApprove({
    amount: bptIn,
    address: lpToken?.address || '',
    issuer: lpToken?.address || '',
    spender: vault || '',
    currency: lpToken?.currency || '',
    enabled: bptIn > 0 && !isXrp,
  });

  const validAmount = token1Amount > 0 || token2Amount > 0;
  const getValidAllowance = () => {
    if (!isXrp) return allowance3;
    if (token1Amount > 0 && token2Amount > 0) return allowance1 && allowance2;
    if (token1Amount > 0) return allowance1;
    if (token2Amount > 0) return allowance2;
  };

  const {
    isLoading: withdrawLiquidityLoading,
    isSuccess: withdrawLiquiditySuccess,
    txData,
    writeAsync,
    blockTimestamp,
  } = useWithdrawLiquidity({
    id: poolId || '',
    tokens: tokensOut || [],
    // input value
    bptIn: parseUnits(`${bptIn}`, TOKEN_DECIMAL_WITHDRAW_LP[network || NETWORK.XRPL]),
    enabled: validAmount && getValidAllowance(),
  });

  const txDate = new Date(blockTimestamp ?? 0);
  const isSuccess = withdrawLiquiditySuccess && !!txData;
  const isLoading = withdrawLiquidityLoading || allowLoading1 || allowLoading2;
  const totalValue = bptIn * lpTokenPrice;

  const step = useMemo(() => {
    if (isSuccess) return tokenLength + 1;

    // single token deposit or in xrpl case (getting approve for receiving token)
    if (tokenLength === 1) {
      if (!isXrp) {
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
      if (allowance2) return 3;
      if (allowance1) return 2;
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
      if (!isXrp) {
        if (step === 1) return allowLoading3;
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
      if (step === 1) return allowLoading1;
      if (step === 2) return allowLoading2;
      if (step === 3) return withdrawLiquidityLoading;
    }

    return false;
  }, [
    withdrawLiquidityLoading,
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
    if (isSuccess) return t('Return to pool page');

    // single token deposit
    if (tokenLength === 1) {
      if (!isXrp) {
        if (!allowance3)
          return t('approve-withdraw-liquidity-token-message', { token: lpToken?.symbol });
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
      if (!allowance1)
        return t('approve-withdraw-liquidity-token-message', {
          token: tokensOut?.[0]?.symbol,
        });
      if (!allowance2)
        return t('approve-withdraw-liquidity-token-message', {
          token: tokensOut?.[1]?.symbol,
        });

      return t('Confirm withdraw liquidity in wallet');
    }

    return '';
  }, [
    allowance1,
    allowance2,
    allowance3,
    isSuccess,
    isXrp,
    lpToken?.symbol,
    t,
    token1Amount,
    token2Amount,
    tokenLength,
    tokensOut,
  ]);

  const handleButtonClick = async () => {
    if (isLoading) return;
    if (isSuccess) {
      close();
      navigate(`/pools/${networkAbbr}/${poolId}`);
      return;
    }

    // single token deposit
    if (tokenLength === 1) {
      if (!isXrp) {
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
      if (!allowance1) return await allowToken1();
      if (!allowance2) return await allowToken2();

      return await writeAsync?.();
    }
  };

  const handleLink = () => {
    const txHash = isXrp ? txData?.hash : txData?.transactionHash;
    const url = `${SCANNER_URL[network || NETWORK.XRPL]}/${
      isXrp ? 'transactions' : 'tx'
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
    if (isSuccess) {
      queryClient.invalidateQueries(['GET', 'POOL']);
      queryClient.invalidateQueries(['GET', 'XRPL']);
      refetchBalance?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, queryClient]);

  return (
    <Popup
      id={POPUP_ID.WITHDRAW_LP}
      title={isSuccess ? '' : t('Withdrawal preview')}
      button={
        <ButtonWrapper onClick={() => handleButtonClick()}>
          <ButtonPrimaryLarge
            // text={isLoading ? 'Confirming' : isSuccess ? 'Return to pool page' : 'Withdraw'}
            text={buttonText}
            isLoading={isLoading}
            buttonType={isSuccess ? 'outlined' : 'filled'}
          />
        </ButtonWrapper>
      }
    >
      <Wrapper>
        {isSuccess && (
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
        {!isSuccess && (
          <List title={t(`You're providing`)}>
            <TokenList
              type="large"
              title={`${formatNumber(bptIn, 6)} ${lpToken?.symbol}`}
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

        {isSuccess && (
          <Scanner onClick={() => handleLink()}>
            <IconTime width={20} height={20} fill={COLOR.NEUTRAL[40]} />
            <ScannerText> {format(new Date(txDate), DATE_FORMATTER.FULL)}</ScannerText>
            <IconLink width={20} height={20} fill={COLOR.NEUTRAL[40]} />
          </Scanner>
        )}
        {!isSuccess && (
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
  text-neutral-100 font-b-24
`;

const SuccessSubTitle = tw.div`
  text-neutral-80 font-r-16
`;

const SuccessWrapper = tw.div`
  flex-center flex-col gap-12
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
