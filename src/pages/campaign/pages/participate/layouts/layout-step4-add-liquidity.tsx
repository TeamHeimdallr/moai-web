import { Suspense, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import { format } from 'date-fns';
import { debounce } from 'lodash-es';
import tw, { css, styled } from 'twin.macro';
import { formatUnits, parseUnits } from 'viem';
import * as yup from 'yup';

import { useAddLiquidity } from '~/api/api-contract/_evm/campaign/add-liquidity';
import {
  useAddLiquidity as useAddLiquiditySubstrate,
  useAddLiquidityPrepare,
} from '~/api/api-contract/_evm/campaign/add-liquidity-substrate';
import { useCalculateAddLiquidity } from '~/api/api-contract/_evm/campaign/calculate-add-liquidity';
import { useUserPoolTokenBalances } from '~/api/api-contract/balance/user-pool-token-balances';
import { useApprove } from '~/api/api-contract/token/approve';

import { COLOR } from '~/assets/colors';
import {
  IconCancel,
  IconCheck,
  IconLink,
  IconTime,
  IconTokenMoai,
  IconTokenRoot,
  IconTokenXrp,
} from '~/assets/icons';
import TokenXrp from '~/assets/icons/icon-token-xrp.svg';

import { CAMPAIGN_ADDRESS, POOL_ID, SCANNER_URL } from '~/constants';

import { AlertMessage } from '~/components/alerts';
import { ButtonPrimaryLarge } from '~/components/buttons';
import { InputNumber } from '~/components/inputs';
import { List } from '~/components/lists';
import { ButtonSkeleton } from '~/components/skeleton/button-skeleton';
import { ListSkeleton } from '~/components/skeleton/list-skeleton';
import { Token } from '~/components/token';
import { TokenList } from '~/components/token-list';

import { useNetwork } from '~/hooks/contexts/use-network';
import { DATE_FORMATTER, formatNumber } from '~/utils';
import { NETWORK } from '~/types';

import { useCampaignStepStore } from '../states/step';
interface InputFormState {
  input: number;
}

export const LayoutStep4AddLiquidity = () => (
  <Suspense fallback={<_AddLiquiditySkeleton />}>
    <_AddLiquidity />
  </Suspense>
);

const _AddLiquidity = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState<number>();
  const [inputValueRaw, setInputValueRaw] = useState<bigint>();

  const [estimatedAddLiquidityFee, setEstimatedAddLiquidityFee] = useState<number | undefined>();
  const [estimatedApproveFee, setEstimatedApproveFee] = useState<number | undefined>();

  const { setStepStatus } = useCampaignStepStore();

  const { t } = useTranslation();

  const { selectedNetwork, isFpass } = useNetwork();
  const isRoot = selectedNetwork === NETWORK.THE_ROOT_NETWORK;

  const {
    lpTokenPrice,
    userPoolTokens,
    refetch: refetchBalance,
  } = useUserPoolTokenBalances({
    network: 'trn',
    id: POOL_ID?.[selectedNetwork]?.ROOT_XRP,
  });
  const xrp = userPoolTokens?.find(t => t.symbol === 'XRP');

  const xrpBalance = xrp?.balance || 0;
  const xrpBalanceRaw = xrp?.balanceRaw || 0n;
  const xrpValue = (xrp?.price || 0) * (inputValue || 0);

  const {
    allow,
    allowance,
    isLoading: allowLoading,
    isSuccess: allowSuccess,
    refetch: refetchAllowance,
    estimateFee: estimateApproveFee,
  } = useApprove({
    amount: inputValueRaw || 0n,
    symbol: xrp?.symbol || 'XRP',
    address: xrp?.address || '',
    issuer: xrp?.address || '',
    spender: CAMPAIGN_ADDRESS[NETWORK.THE_ROOT_NETWORK],
    currency: xrp?.currency || '',
    enabled: !!xrp && isRoot,
  });

  const addLiquidityEnabled = !!inputValueRaw && inputValueRaw > 0n && allowance;
  const addLiquidityEvm = useAddLiquidity({
    xrpAmount: inputValueRaw || 0n,
    enabled: !isFpass && isRoot && addLiquidityEnabled,
  });
  const addLiquiditySubstrate = useAddLiquiditySubstrate({
    xrpAmount: inputValueRaw || 0n,
    enabled: isFpass && isRoot && addLiquidityEnabled,
  });
  const {
    isPrepareLoading: addLiquiditySubstratePrepareLoading,
    isPrepareError: addLiquiditySubstratePrepareIsError,
    prepareError: addLiquiditySubstratePrepareError,
  } = useAddLiquidityPrepare({
    xrpAmount: inputValueRaw || 0n,
    enabled: isFpass && isRoot && addLiquidityEnabled,
  });

  const addLiquidity = isFpass ? addLiquiditySubstrate : addLiquidityEvm;
  const {
    isPrepareLoading: addLiquidityPrepareLoading,
    isLoading: addLiquidityLoading,
    isSuccess: addLiquiditySuccess,
    isError: addLiquidityIsError,
    error: addLiquidityError,
    txData,
    blockTimestamp,
    reset,
    writeAsync,
    estimateFee: estimateAddLiquidityFee,
  } = addLiquidity;
  const { bptOut } = useCalculateAddLiquidity({ xrpAmount: inputValue || 0 });
  const actualBptOut = (bptOut || 0) / 2;

  const txDate = new Date(blockTimestamp || 0);
  const isIdle = !txData;
  const isSuccess = addLiquiditySuccess && !!txData;
  const isLoading = addLiquidityLoading || allowLoading;

  const isErrorRaw = addLiquidityIsError || addLiquiditySubstratePrepareIsError;
  const error = addLiquidityError || addLiquiditySubstratePrepareError;
  const approveError = error?.message?.includes('Approved');
  const reserveError = error?.message?.includes('Not enough supported ROOT liquidity');

  const isError = isErrorRaw && !approveError;

  const schema = yup.object().shape({
    input: yup.number().min(0).max(xrpBalance, t('Exceeds wallet balance')).required(),
  });
  const { control, setValue, formState } = useForm<InputFormState>({
    resolver: yupResolver(schema),
  });

  const buttonText = useMemo(() => {
    if (addLiquidityLoading) return t('Confirming...');

    if (!isIdle) {
      if (isSuccess) return t('Return to voyage page');
      return t('Try again');
    }

    if (!allowance)
      return t('approve-add-liquidity-token-message', { token: xrp?.symbol || 'XRP' });

    return t('Confirm add liquidity in wallet');
  }, [allowance, isIdle, addLiquidityLoading, isSuccess, t, xrp?.symbol]);

  const estimatedFee = allowance ? estimatedAddLiquidityFee : estimatedApproveFee;
  const enoughBalance = xrpBalanceRaw > (inputValue || 0) + (estimatedFee || 0);

  const invalid = isError || !estimatedFee || !enoughBalance || (inputValueRaw || 0n) <= 0n;
  const invalidWithLoading =
    invalid ||
    isLoading ||
    (!isFpass && addLiquidityPrepareLoading) ||
    (isFpass && addLiquiditySubstratePrepareLoading);

  const handleButtonClick = async () => {
    if (invalidWithLoading) return;

    if (!allowance) return await allow?.();
    return await writeAsync?.();
  };

  const handleLink = () => {
    const txHash = isFpass ? txData?.extrinsicId : txData?.transactionHash;
    const url = `${SCANNER_URL[selectedNetwork]}/${isFpass ? 'extrinsic' : 'tx'}/${txHash}`;

    window.open(url);
  };

  useEffect(() => {
    if (allowSuccess || inputValueRaw) refetchAllowance();
  }, [allowSuccess, inputValueRaw, refetchAllowance]);

  useEffect(() => {
    if (!isIdle) refetchBalance?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isIdle]);

  useEffect(() => {
    const estimateFeeAsync = async () => {
      const approveFee = await estimateApproveFee?.();
      setEstimatedApproveFee(approveFee);
    };

    estimateFeeAsync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xrp?.address, selectedNetwork]);

  useEffect(() => {
    const estimateFeeAsync = async () => {
      const fee = await estimateAddLiquidityFee?.();
      setEstimatedAddLiquidityFee(fee);
    };

    estimateFeeAsync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNetwork]);

  useEffect(() => {
    if (addLiquidityLoading) setStepStatus({ id: 4, status: 'loading' }, 3);
    else {
      if (isIdle) setStepStatus({ id: 4, status: 'idle' }, 3);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addLiquidityLoading, isIdle]);

  useEffect(() => {
    if (isSuccess) setStepStatus({ id: 4, status: 'done' }, 3);
    else {
      if (isIdle) setStepStatus({ id: 4, status: 'idle' }, 3);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, isIdle]);

  useEffect(() => {
    return () => {
      reset?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {!isIdle && isSuccess && (
        <>
          <SuccessWrapper>
            <SuccessMessageWrapper>
              <SuccessIconWrapper>
                <IconCheck width={40} height={40} fill={COLOR.NEUTRAL[0]} />
              </SuccessIconWrapper>
              <SuccessTitle>{t('Add liquidity confirmed!')}</SuccessTitle>
              <SuccessSubTitle>{t('campaign-add-liquidity-success-message')}</SuccessSubTitle>
            </SuccessMessageWrapper>
            <List title={t('Expected LP token')}>
              <TokenList
                type="campaign"
                title="50ROOT-50XRP"
                image={
                  <LpTokenIconWrapper>
                    <LpTokenLeft>
                      <IconTokenRoot width={36} height={36} />
                    </LpTokenLeft>
                    <LpTokenRight>
                      <IconTokenXrp width={36} height={36} />
                    </LpTokenRight>
                  </LpTokenIconWrapper>
                }
                balance={`${formatNumber(actualBptOut, 4)}`}
                value={`$${formatNumber(actualBptOut * lpTokenPrice, 4)}`}
              />
            </List>
            <List title={t('Expected rewards')}>
              <TokenList
                type="campaign"
                title={t('$ROOT reward (APR 10%)')}
                image={<IconTokenRoot width={36} height={36} />}
              />
              <Divider />
              <TokenList
                type="campaign"
                title={t('Pre-mining $veMOI')}
                image={<IconTokenMoai width={36} height={36} />}
              />
            </List>
            <SuccessBottomWrapper>
              <TimeWrapper>
                <IconTime />
                {format(new Date(), DATE_FORMATTER.FULL)}
                <ClickableIcon onClick={handleLink}>
                  <IconLink />
                </ClickableIcon>
              </TimeWrapper>
              <ButtonPrimaryLarge
                text={t('Return to voyage page')}
                buttonType="outlined"
                onClick={() => navigate('/campaign')}
              />
            </SuccessBottomWrapper>
          </SuccessWrapper>
        </>
      )}
      {!isIdle && !isSuccess && (
        <>
          <SuccessWrapper>
            <SuccessMessageWrapper>
              <FailedIconWrapper>
                <IconCancel width={40} height={40} fill={COLOR.NEUTRAL[0]} />
              </FailedIconWrapper>
              <SuccessTitle>
                {t(reserveError ? 'Lack of reserve' : 'Add liquidity failed')}
              </SuccessTitle>
              <SuccessSubTitle>
                {t(
                  reserveError
                    ? 'lack-of-reserve-description'
                    : 'campaign-add-liquidity-failed-message'
                )}
              </SuccessSubTitle>
            </SuccessMessageWrapper>
            <ButtonPrimaryLarge
              text={t('Try again')}
              buttonType="outlined"
              onClick={() => navigate('/campaign')}
            />
          </SuccessWrapper>
        </>
      )}
      {isIdle && (
        <Wrapper>
          <InputNumber
            name={'input'}
            title={t("You're providing")}
            control={control}
            token={<Token token={'XRP'} image imageUrl={TokenXrp} />}
            tokenName={'XRPL'}
            tokenValue={xrpValue}
            balance={xrpBalance}
            balanceRaw={xrpBalanceRaw}
            value={inputValue}
            handleChange={debounce(val => {
              setInputValue(val);
              setInputValueRaw(parseUnits((val || 0).toFixed(6), 6));
            }, 300)}
            handleChangeRaw={debounce(val => {
              setInputValue(Number(formatUnits(val || 0n, 6)));
              setInputValueRaw(val);
            }, 300)}
            maxButton
            setValue={setValue}
            formState={formState}
          />
          <List title={t('Expected LP token')}>
            <TokenList
              type="campaign"
              title="50ROOT-50XRP"
              image={
                <LpTokenIconWrapper>
                  <LpTokenLeft>
                    <IconTokenRoot width={36} height={36} />
                  </LpTokenLeft>
                  <LpTokenRight>
                    <IconTokenXrp width={36} height={36} />
                  </LpTokenRight>
                </LpTokenIconWrapper>
              }
              balance={`${formatNumber(actualBptOut, 4)}`}
              value={`$${formatNumber(actualBptOut * lpTokenPrice, 4)}`}
            />
          </List>
          <List title={t('Expected rewards')}>
            <TokenList
              type="campaign"
              title={t('$ROOT reward (APR 10%)')}
              image={<IconTokenRoot width={36} height={36} />}
            />
            <Divider />
            <TokenList
              type="campaign"
              title={t('Pre-mining $veMOI')}
              image={<IconTokenMoai width={36} height={36} />}
            />
          </List>
          <TotalXrpWrapper>
            <TextWrapper>
              <TotalExpectedXrp>{t('Gas fee')}</TotalExpectedXrp>
              <Amount>
                {estimatedFee ? `~${formatNumber(estimatedFee)} XRP` : t('calculating...')}
              </Amount>
            </TextWrapper>
            <GasCaption>{t('gas-price-caption')}</GasCaption>
          </TotalXrpWrapper>
          {reserveError && (
            <AlertMessage
              title={t('Lack of reserve')}
              description={t('lack-of-reserve-description')}
              type="warning"
            />
          )}
          <ButtonPrimaryLarge
            text={buttonText}
            isLoading={addLiquidityLoading}
            disabled={invalid}
            onClick={handleButtonClick}
          />
        </Wrapper>
      )}
    </>
  );
};

const _AddLiquiditySkeleton = () => {
  const { t } = useTranslation();
  return (
    <Wrapper>
      <ListSkeleton title={t("You're providing")} network={NETWORK.XRPL} height={150} />
      <ListSkeleton
        title={t('Expected APR (10%)')}
        network={NETWORK.THE_ROOT_NETWORK}
        height={191}
      />
      <ButtonSkeleton />
    </Wrapper>
  );
};

const Wrapper = tw.div`
  relative w-full flex flex-col p-24 bg-neutral-10 rounded-12 gap-24
`;

const Divider = tw.div`
  w-full h-1 flex-shrink-0 bg-neutral-20
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
  w-full flex flex-col bg-neutral-10 pt-40 p-24 gap-40 rounded-12
`;

const SuccessMessageWrapper = tw.div`
  flex-center flex-col gap-12 
`;
const SuccessBottomWrapper = tw.div`
  flex flex-col gap-16
`;
const SuccessIconWrapper = tw.div`
  flex-center w-48 h-48 rounded-full bg-green-50
`;

const FailedIconWrapper = tw.div`
  flex-center w-48 h-48 rounded-full bg-red-50
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

const TotalXrpWrapper = tw.div`
  w-full flex flex-col px-16 py-8 bg-neutral-15 rounded-8
`;

const TotalExpectedXrp = tw.div`
  font-r-16 text-neutral-100
`;

const TextWrapper = tw.div`
  w-full flex items-center justify-between
`;

const Amount = tw.div`
  font-m-16 text-neutral-100
`;

const GasCaption = tw.div`
  font-r-12 text-neutral-60
`;

const LpTokenIconWrapper = tw.div`
  w-64 h-36 relative
`;

const LpTokenLeft = tw.div`
  absolute top-0 left-0 w-36 h-full rounded-full z-1
`;
const LpTokenRight = tw.div`
  absolute top-0 right-0 w-36 h-full rounded-full z-2
`;
