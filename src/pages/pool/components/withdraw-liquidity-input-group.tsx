import { Fragment, Suspense, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import tw, { css, styled } from 'twin.macro';
import { formatUnits, parseUnits } from 'viem';
import * as yup from 'yup';

import { useWithdrawLiquidityPrepare as useWithdrawLiquidityPrepareEvm } from '~/api/api-contract/_evm/pool/withdraw-liquidity-substrate';
import { useUserPoolTokenBalances } from '~/api/api-contract/balance/user-pool-token-balances';
import { useCalculateWithdrawLiquidity } from '~/api/api-contract/pool/calculate-withdraw-liquidity';
import { useGetPoolQuery } from '~/api/api-server/pools/get-pool';

import { IconSetting } from '~/assets/icons';

import { ASSET_URL, THOUSAND } from '~/constants';

import { Slippage } from '~/components/account';
import { AlertMessage } from '~/components/alerts';
import { ButtonPrimaryLarge } from '~/components/buttons';
import { InputNumber } from '~/components/inputs';
import { SkeletonBase } from '~/components/skeleton/skeleton-base';
import { Tab } from '~/components/tab';
import { Token } from '~/components/token';
import { TokenList } from '~/components/token-list';

import { usePopup } from '~/hooks/components';
import { useOnClickOutside } from '~/hooks/utils';
import { formatNumber } from '~/utils';
import { useWithdrawLiquidityInputGroupTabStore } from '~/states/components/input-group/tab';
import { POPUP_ID } from '~/types';

import { WithdrawLiquidityPopup } from './withdraw-liquidity-popup';

interface InputFormState {
  input1: number;
}

export const WithdrawLiquidityInputGroup = () => {
  return (
    <Suspense fallback={<_WithdrawLiquidityInputGroupSkeleton />}>
      <_WithdrawLiquidityInputGroup />
    </Suspense>
  );
};

const _WithdrawLiquidityInputGroup = () => {
  const ref = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  const [opened, open] = useState(false);
  const toggle = () => open(!opened);

  useOnClickOutside([ref, iconRef], () => open(false));

  const { network, id } = useParams();
  const { t } = useTranslation();

  const [inputValue, setInputValue] = useState<number>();
  const [inputValueRaw, setInputValueRaw] = useState<bigint>();

  const tabs = [
    { key: 'proportional', name: t('Proportional pool tokens withdraw') },
    { key: 'single', name: t('Single token withdraw'), disabled: true },
  ];
  const { selectedTab, selectTab } = useWithdrawLiquidityInputGroupTabStore();
  const { opened: popupOpened, open: popupOpen } = usePopup(POPUP_ID.WITHDRAW_LP);

  const queryEnabled = !!network && !!id;
  const { data: poolData } = useGetPoolQuery(
    {
      params: {
        networkAbbr: network as string,
        poolId: id as string,
      },
    },
    {
      enabled: queryEnabled,
      staleTime: 1000,
    }
  );

  const { pool } = poolData || {};
  const { compositions, lpToken } = pool || {};

  const { lpTokenPrice, userLpTokenBalance, userLpTokenBalanceRaw, refetch } =
    useUserPoolTokenBalances();
  const { proportionalTokensOut, priceImpact: priceImpactRaw } = useCalculateWithdrawLiquidity({
    bptIn: inputValue || 0,
  });
  const priceImpact = priceImpactRaw < 0.01 ? '< 0.01' : formatNumber(priceImpactRaw);
  const withdrawTokenValue = (inputValue || 0) * (lpTokenPrice || 0);
  const withdrawTokenWeight = userLpTokenBalance ? (inputValue || 0) / userLpTokenBalance : 0;

  const schema = yup.object().shape({
    input1: yup
      .number()
      .min(0)
      .max(userLpTokenBalance || 0, t('Exceeds wallet balance'))
      .required(),
  });
  const { control, setValue, formState } = useForm<InputFormState>({
    resolver: yupResolver(schema),
  });

  const isFormError = !!formState?.errors?.input1;
  const isValidToWithdraw =
    (!isFormError && (inputValue || 0) > 0) || (inputValue || 0) <= userLpTokenBalance;

  const { isPrepareLoading, isPrepareError, prepareError } = useWithdrawLiquidityPrepareEvm({
    poolId: pool?.poolId || '',
    tokens: proportionalTokensOut || [],
    bptIn: inputValueRaw || 0n,
    enabled: !!pool?.poolId && isValidToWithdraw,
  });

  const errorMessage = prepareError?.message;
  const poolImpactError = errorMessage?.includes('306');

  const errorTitle = t(poolImpactError ? 'Withdraw impact too high' : 'Something went wrong');
  const errorDescription = t(
    poolImpactError ? 'withdraw-impact-error-message' : 'unknown-error-message'
  );

  return (
    <Wrapper>
      <Header>
        <Tab tabs={tabs} selectedTab={selectedTab} onClick={selectTab} />

        <IconWrapper onClick={toggle} ref={iconRef}>
          <IconSetting fill={opened ? '#F5FF83' : '#9296AD'} width={20} height={20} />
        </IconWrapper>
        {opened && (
          <SlippageWrapper ref={ref}>
            <Slippage shadow />
          </SlippageWrapper>
        )}
      </Header>
      <InnerWrapper>
        <ContentWrapper>
          <SubTitle>{t('You provide')}</SubTitle>
          <InputNumber
            name={'input1'}
            control={control}
            token={
              <Token
                token={lpToken?.symbol || ''}
                image
                imageUrl={
                  <LpWrapper images={[compositions?.[0]?.image, compositions?.[1]?.image]}>
                    <div />
                    <div />
                  </LpWrapper>
                }
                address={lpToken?.address}
                clickable={false}
              />
            }
            tokenName={lpToken?.symbol || ''}
            tokenValue={withdrawTokenValue}
            balance={userLpTokenBalance || 0}
            balanceRaw={userLpTokenBalanceRaw || 0n}
            value={inputValue}
            handleChange={val => {
              setInputValue(val);
              // setInputValueRaw(parseUnits((val || 0).toFixed(18), 18));
            }}
            handleChangeRaw={val => {
              // setInputValue(Number(formatUnits(val || 0n, 18)));
              setInputValueRaw(val);
            }}
            maxButton
            slider
            sliderActive
            setValue={setValue}
            formState={formState}
          />
        </ContentWrapper>
        <ContentWrapper>
          <SubTitle>{t('You receive')}</SubTitle>
          <TokenListWrapper>
            {compositions?.map(({ symbol, image, price }, i) => {
              const amount = proportionalTokensOut?.[i]?.amount || 0;
              return (
                <Fragment key={symbol + i}>
                  <TokenList
                    type="large"
                    title={`${formatNumber(amount, 4, 'floor', THOUSAND, 0)} ${symbol}`}
                    description={`$${formatNumber(amount * (price || 0))}`}
                    image={image || `${ASSET_URL}/tokens/token-unknown.png`}
                    leftAlign
                  />
                  {i !== (compositions?.length || 0) - 1 && <Divider />}
                </Fragment>
              );
            })}
          </TokenListWrapper>
        </ContentWrapper>
        <PriceImpaceWrapper>
          <PriceImpact>{t('Price impact')}</PriceImpact>
          <PriceImpact>{`${priceImpact}%`}</PriceImpact>
        </PriceImpaceWrapper>
      </InnerWrapper>

      {isPrepareError && (
        <AlertMessage title={errorTitle} description={errorDescription} type="warning" />
      )}

      <ButtonPrimaryLarge
        text={t('Preview')}
        onClick={() => popupOpen()}
        disabled={!isValidToWithdraw || isPrepareLoading || isPrepareError}
      />

      {popupOpened && !isPrepareError && (
        <WithdrawLiquidityPopup
          pool={pool}
          tokensOut={proportionalTokensOut}
          lpTokenPrice={lpTokenPrice}
          bptIn={inputValueRaw || 0n}
          priceImpact={priceImpact}
          withdrawTokenWeight={withdrawTokenWeight}
          refetchBalance={refetch}
        />
      )}
    </Wrapper>
  );
};

const _WithdrawLiquidityInputGroupSkeleton = () => {
  const { t } = useTranslation();
  const tabs = [
    { key: 'proportional', name: t('Proportional pool tokens') },
    { key: 'single', name: t('Single token'), disabled: true },
  ];
  const { selectedTab } = useWithdrawLiquidityInputGroupTabStore();
  return (
    <Wrapper>
      <Header>
        <Tab tabs={tabs} selectedTab={selectedTab} />
        <IconWrapper>
          <IconSetting fill={'#9296AD'} width={20} height={20} />
        </IconWrapper>
      </Header>
      <InnerWrapper>
        <ContentWrapper>
          <SubTitle>{t('You provide')}</SubTitle>
          <SkeletonBase height={128} />
        </ContentWrapper>
        <ContentWrapper>
          <SubTitle>{t('You receive')}</SubTitle>
          <SkeletonBase height={145} />
        </ContentWrapper>
        <SkeletonBase height={46} />
        <SkeletonBase height={46} borderRadius={12} />
      </InnerWrapper>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col bg-neutral-10 gap-20 px-20 py-16 rounded-12
  md:(w-455 gap-24 pt-20 px-24 pb-24)
`;

const Header = tw.div`
  flex w-full justify-between items-center gap-12 relative
`;

const SlippageWrapper = tw.div`
  absolute top-40 right-0 z-10
`;

const InnerWrapper = tw.div`
  flex flex-col gap-16
`;

const IconWrapper = tw.div`
  clickable w-32 h-32 items-center justify-center flex relative
`;

const ContentWrapper = tw.div`
  flex flex-col gap-8
`;

const SubTitle = tw.div`
  text-neutral-100 font-m-12
`;

const TokenListWrapper = tw.div`
  flex flex-col rounded-8 bg-neutral-15
`;

const Divider = tw.div`
  w-full h-1 bg-neutral-20
`;

const PriceImpaceWrapper = tw.div`
  bg-neutral-15 rounded-8 py-12 px-16 font-r-14 text-neutral-100 flex gap-10 items-center
`;

const PriceImpact = tw.div``;

interface LpWrapperProps {
  images: (string | undefined)[];
}
const LpWrapper = styled.div<LpWrapperProps>(({ images }) => [
  tw`relative w-40 h-24`,
  css`
    & > div {
      width: 24px;
      height: 24px;

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
