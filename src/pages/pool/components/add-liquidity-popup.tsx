import { Fragment, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import tw from 'twin.macro';
import { toHex } from 'viem';
import { useQueryClient } from 'wagmi';

import { useAddLiquidity } from '~/api/api-contract/pool/add-liquiditiy';
import { useApprove } from '~/api/api-contract/token/approve';
import { useGetPoolVaultAmmQuery } from '~/api/api-server/pools/get-pool-vault-amm';

import { COLOR } from '~/assets/colors';
import { IconCheck, IconLink, IconTime } from '~/assets/icons';

import { SCANNER_URL } from '~/constants';

import { ButtonPrimaryLarge } from '~/components/buttons';
import { List } from '~/components/lists';
import { LoadingStep } from '~/components/loadings/step';
import { Popup } from '~/components/popup';
import { TokenList } from '~/components/token-list';

import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { DATE_FORMATTER, formatNumber, getNetworkAbbr } from '~/utils';
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
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { t } = useTranslation();

  const { isXrp } = useNetwork();
  const { network, poolId, lpToken } = pool || {};
  const networkAbbr = getNetworkAbbr(network);

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

  const {
    allow: allowToken1,
    allowance: allowance1,
    isLoading: allowLoading1,
    isSuccess: allowSuccess1,
    refetch: refetchAllowance1,
  } = useApprove({
    amount: token1Amount,
    address: tokensIn?.[0]?.address || '',
    issuer: tokensIn?.[0]?.address || '',
    spender: vault || '',
    currency: tokensIn?.[0]?.currency || '',
    enabled: token1Amount > 0 && !isXrp,
  });

  const {
    allow: allowToken2,
    allowance: allowance2,
    isLoading: allowLoading2,
    isSuccess: allowSuccess2,
    refetch: refetchAllowance2,
  } = useApprove({
    amount: token2Amount,
    address: tokensIn?.[1]?.address || '',
    issuer: tokensIn?.[1]?.address || '',
    spender: vault || '',
    currency: tokensIn?.[1]?.currency || '',
    enabled: token2Amount > 0 && !isXrp,
  });

  const {
    allow: allowToken3,
    allowance: allowance3,
    isLoading: allowLoading3,
    isSuccess: allowSuccess3,
    refetch: refetchAllowance3,
  } = useApprove({
    amount: bptOut,
    address: lpToken?.address || '',
    issuer: lpToken?.address || '',
    spender: vault || '',
    currency: lpToken?.currency || '',
    enabled: bptOut > 0 && isXrp,
  });

  const validAmount = token1Amount > 0 || token2Amount > 0;
  const getValidAllowance = () => {
    if (isXrp) return allowance3;
    if (token1Amount > 0 && token2Amount > 0) return allowance1 && allowance2;
    if (token1Amount > 0) return allowance1;
    if (token2Amount > 0) return allowance2;
  };

  const {
    isLoading: addLiquidityLoading,
    isSuccess: addLiquiditySuccess,
    txData,
    blockTimestamp,
    writeAsync,
  } = useAddLiquidity({
    id: poolId || '',
    tokens: tokensIn || [],
    enabled: validAmount && getValidAllowance(),
  });

  const txDate = new Date(blockTimestamp ?? 0);
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
      if (step === 1) return allowLoading1;
      if (step === 2) return allowLoading2;
      if (step === 3) return addLiquidityLoading;
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
    if (isSuccess) return t('Return to pool page');

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
      if (!allowance1)
        return t('approve-add-liquidity-token-message', { token: tokensIn?.[0]?.symbol });
      if (!allowance2)
        return t('approve-add-liquidity-token-message', { token: tokensIn?.[1]?.symbol });

      return t('Confirm add liquidity in wallet');
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
    tokensIn,
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
      if (!allowance1) return await allowToken1();
      if (!allowance2) return await allowToken2();

      return await writeAsync?.();
    }
  };

  const handleLink = () => {
    const txHash = isXrp ? txData?.hash : txData?.transactionHash;
    const url = `${SCANNER_URL[network || NETWORK.THE_ROOT_NETWORK]}/${
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
      id={POPUP_ID.ADD_LP}
      title={isSuccess ? '' : t('Add liquidity preview')}
      button={
        <ButtonWrapper onClick={() => handleButtonClick()}>
          <ButtonPrimaryLarge
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
            <SuccessTitle>{t('Add liquidity confirmed!')}</SuccessTitle>
            <SuccessSubTitle>
              {t('add-liquidity-success-message', { pool: lpToken?.symbol })}
            </SuccessSubTitle>
          </SuccessWrapper>
        )}
        {!isSuccess && (
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
                <SummaryTextTitle>{t('Total liquidity')}</SummaryTextTitle>
                <SummaryText>{`$${formatNumber(bptOut * lpTokenPrice, 6)}`}</SummaryText>
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
