// lack of root 는 미리 검증해서 티켓 쏘기
// reward 처럼 일정 시간마다 남은 루트 양 보여주도록 처리
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import { format } from 'date-fns';
import tw, { css, styled } from 'twin.macro';
import { formatUnits, parseUnits } from 'viem';
import * as yup from 'yup';

import { useAddLiquidity } from '~/api/api-contract/_evm/campaign/add-liquidity';
import {
  useAddLiquidity as useAddLiquiditySubstrate,
  useAddLiquidityPrepare,
} from '~/api/api-contract/_evm/campaign/add-liquidity-substrate';
import { useUserPoolTokenBalances } from '~/api/api-contract/balance/user-pool-token-balances';
import { useApprove } from '~/api/api-contract/token/approve';

import { COLOR } from '~/assets/colors';
import {
  IconCheck,
  IconLink,
  IconTime,
  IconTokenMoai,
  IconTokenRoot,
  IconTokenXrp,
} from '~/assets/icons';
import TokenXrp from '~/assets/icons/icon-token-xrp.svg';

import { CAMPAIGN_ADDRESS, POOL_ID } from '~/constants';

import { ButtonPrimaryLarge } from '~/components/buttons';
import { InputNumber } from '~/components/inputs';
import { List } from '~/components/lists';
import { ButtonSkeleton } from '~/components/skeleton/button-skeleton';
import { ListSkeleton } from '~/components/skeleton/list-skeleton';
import { Token } from '~/components/token';
import { TokenList } from '~/components/token-list';

import { useNetwork } from '~/hooks/contexts/use-network';
import { DATE_FORMATTER } from '~/utils';
import { NETWORK } from '~/types';
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

  const { t } = useTranslation();

  const { selectedNetwork, isFpass } = useNetwork();
  const isRoot = selectedNetwork === NETWORK.THE_ROOT_NETWORK;

  const { userPoolTokens, refetch: refetchBalance } = useUserPoolTokenBalances({
    network: 'trn',
    id: POOL_ID?.[selectedNetwork]?.ROOT_XRP,
  });
  const xrp = userPoolTokens?.find(t => t.symbol === 'XRP');
  const xrpBalance = xrp?.balance || 0;
  const xrpBalanceRaw = xrp?.balanceRaw || 0n;

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
    isPrepareError: addLiquiditySubstratePrepareError,
  } = useAddLiquidityPrepare({
    xrpAmount: inputValueRaw || 0n,
    enabled: isFpass && isRoot && addLiquidityEnabled,
  });

  const addLiquidity = isFpass ? addLiquiditySubstrate : addLiquidityEvm;
  const {
    isPrepareLoading: addLiquidityPrepareLoading,
    isLoading: addLiquidityLoading,
    isSuccess: addLiquiditySuccess,
    isError: addLiquidityError,
    txData,
    blockTimestamp,
    writeAsync,
    estimateFee: estimateAddLiquidityFee,
  } = addLiquidity;

  const txDate = new Date(blockTimestamp || 0);
  const isIdle = !txData;
  const isSuccess = addLiquiditySuccess && !!txData;
  const isLoading = addLiquidityLoading || allowLoading;
  const isError = addLiquidityError || addLiquiditySubstratePrepareError;

  const schema = yup.object().shape({
    input: yup.number().min(0).max(xrpBalance).required(),
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

  const handleButtonClick = async () => {
    if (
      isLoading ||
      (!isFpass && addLiquidityPrepareLoading) ||
      (isFpass && addLiquiditySubstratePrepareLoading)
    )
      return;

    if (!allowance) return await allow?.();
    return await writeAsync?.();
  };

  useEffect(() => {
    if (allowSuccess) refetchAllowance();
  }, [allowSuccess, refetchAllowance]);

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
  }, [xrp?.address]);

  useEffect(() => {
    const estimateFeeAsync = async () => {
      const fee = await estimateAddLiquidityFee?.();
      setEstimatedAddLiquidityFee(fee);
    };

    estimateFeeAsync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const estimatedFee = allowance ? estimatedAddLiquidityFee : estimatedApproveFee;

  return (
    <>
      {!isIdle && isSuccess && (
        <>
          <SuccessWrapper>
            <SuccessMessageWrapper>
              <SuccessIconWrapper>
                <IconCheck width={40} height={40} />
              </SuccessIconWrapper>
              <SuccessTitle>{t('Add liquidity confirmed!')}</SuccessTitle>
              <SuccessSubTitle>{t('campaign-add-liquidity-success-message')}</SuccessSubTitle>
            </SuccessMessageWrapper>
            <SuccessBottomWrapper>
              <TimeWrapper>
                <IconTime />
                {format(new Date(), DATE_FORMATTER.FULL)}
                <ClickableIcon>
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
      {!isIdle && !isSuccess && <></>}
      {isIdle && (
        <Wrapper>
          <InputNumber
            name={'input'}
            title={t("You're providing")}
            control={control}
            token={<Token token={'XRP'} image imageUrl={TokenXrp} />}
            tokenName={'XRPL'}
            tokenValue={0}
            balance={xrpBalance}
            balanceRaw={xrpBalanceRaw}
            value={inputValue}
            handleChange={val => {
              setInputValue(val);
              setInputValueRaw(parseUnits((val || 0).toFixed(6), 6));
            }}
            handleChangeRaw={val => {
              setInputValue(Number(formatUnits(val || 0n, 6)));
              setInputValueRaw(val);
            }}
            maxButton
            setValue={setValue}
            formState={formState}
          />
          <ButtonPrimaryLarge
            text={buttonText}
            isLoading={addLiquidityLoading}
            disabled={
              isError ||
              isLoading ||
              (!isFpass && addLiquidityPrepareLoading) ||
              (isFpass && addLiquiditySubstratePrepareLoading)
            }
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
  flex flex-col bg-neutral-10 pt-40 p-24 gap-40 rounded-12
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
