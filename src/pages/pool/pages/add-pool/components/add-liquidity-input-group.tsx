import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { yupResolver } from '@hookform/resolvers/yup';
import tw from 'twin.macro';
import * as yup from 'yup';

import { useUserTokenBalances } from '~/api/api-contract/_xrpl/balance/user-token-balances';

import { IconSetting } from '~/assets/icons';

import { TRILLION } from '~/constants';

import { ButtonPrimaryLarge, ButtonPrimarySmall } from '~/components/buttons';
import { InputNumber } from '~/components/inputs';
import { SkeletonBase } from '~/components/skeleton/skeleton-base';
import { Token } from '~/components/token';

import { usePopup } from '~/hooks/components';
import { formatNumber } from '~/utils';
import { POPUP_ID } from '~/types';

import { useXrplPoolAddTokenPairStore } from '../states/token-pair';

import { AddLiquidityPopup } from './add-liquidity-popup';

interface InputFormState {
  input1: number;
  input2: number;
}

export const AddLiquidityInputGroup = () => {
  return (
    <Suspense fallback={<_AddLiquidityInputGroupSkeleton />}>
      <_AddLiquidityInputGroup />
    </Suspense>
  );
};

const _AddLiquidityInputGroup = () => {
  const [inputBlured, inputBlurAll] = useState(false);

  const { t } = useTranslation();

  const { opened: popupOpened, open: popupOpen } = usePopup(POPUP_ID.XRPL_ADD_LIQUIDITY_POPUP);

  const { token1, token2 } = useXrplPoolAddTokenPairStore();

  const { userTokenBalances } = useUserTokenBalances({
    targetTokens:
      [token1, token2]?.map(t => ({ issuer: t?.address || '', currency: t?.currency || '' })) || [],
  });

  const schema = yup.object().shape({
    input1: yup
      .number()
      .min(0)
      .max(userTokenBalances?.[0]?.balance || 0, t('Exceeds wallet balance'))
      .required(),
    input2: yup
      .number()
      .min(0)
      .max(userTokenBalances?.[1]?.balance || 0, t('Exceeds wallet balance'))
      .required(),
  });

  const { control, watch, setValue, formState } = useForm<InputFormState>({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const { input1: _input1, input2: _input2 } = watch();
  const inputValues = [_input1 || 0, _input2 || 0];

  const ableToAddLiquidityTokens = userTokenBalances.filter(token => token.balance > 0);
  const isValidToAddLiquidity = ableToAddLiquidityTokens.length > 0;
  const inputError = !!formState.errors.input1?.message || !!formState.errors.input2?.message;

  const totalValue = userTokenBalances.some(t => !t.price)
    ? undefined
    : userTokenBalances.reduce(
        (acc, cur, i) => (acc += (cur.price || 0) * (inputValues[i] || 0)),
        0
      );

  const tokensIn = userTokenBalances.map((token, i) => ({
    ...token,
    amount: inputValues[i],
  }));
  const maxed =
    _input1 &&
    _input2 &&
    _input1 === userTokenBalances?.[0]?.balance &&
    _input2 === userTokenBalances?.[1]?.balance;

  const handleMax = () => {
    setValue('input1', userTokenBalances?.[0]?.balance || 0);
    setValue('input2', userTokenBalances?.[1]?.balance || 0);
  };
  const handleCreatePool = () => {
    if (!isValidToAddLiquidity || inputError || !_input1 || !_input2) return;
    popupOpen();
  };

  return (
    <Wrapper>
      <InnerWrapper>
        <ContentWrapper>
          {userTokenBalances.map((token, idx) => {
            const tokenValue = (token?.price || 0) * (inputValues[idx] || 0);

            return (
              <InputNumber
                key={token.symbol + idx}
                name={`input${idx + 1}`}
                control={control}
                token={<Token token={token.symbol} image imageUrl={token.image} />}
                tokenName={token.symbol}
                tokenValue={!token.price ? undefined : tokenValue}
                balance={token.balance}
                slider={inputValues[idx] > 0}
                value={inputValues[idx]}
                setValue={setValue}
                formState={formState}
                maxButton
                blurAll={inputBlurAll}
                blured={inputBlured}
              />
            );
          })}
        </ContentWrapper>

        <ContentWrapper>
          <SubTitle>{t('Summary')}</SubTitle>
          <Total>
            <TotalInnerWrapper>
              <TotalText>{t(`Total value`)}</TotalText>
              <TotalValueWrapper>
                {totalValue ? (
                  <>
                    <TotalValue>{`$${formatNumber(
                      totalValue,
                      2,
                      'floor',
                      TRILLION,
                      2
                    )}`}</TotalValue>
                    <ButtonPrimarySmall
                      text={maxed ? t('Maxed') : t('Max')}
                      onClick={handleMax}
                      style={{ width: 'auto' }}
                      isBlack
                      disabled={!!maxed}
                    />
                  </>
                ) : (
                  <TotalValue>-</TotalValue>
                )}
              </TotalValueWrapper>
            </TotalInnerWrapper>
          </Total>
        </ContentWrapper>
      </InnerWrapper>

      <ButtonPrimaryLarge
        text={t('Create a pool')}
        onClick={handleCreatePool}
        disabled={!isValidToAddLiquidity || inputError || !_input1 || !_input2}
      />

      {popupOpened && <AddLiquidityPopup tokensIn={tokensIn} />}
    </Wrapper>
  );
};

const _AddLiquidityInputGroupSkeleton = () => {
  const { t } = useTranslation();
  return (
    <SkeletonWrapper>
      <Header>
        <Title>{t('Enter liquidity amount')}</Title>
        <IconWrapper>
          <IconSetting fill={'#9296AD'} width={20} height={20} />
        </IconWrapper>
      </Header>
      <InnerWrapper>
        <SkeletonBase type="light" height={108} />
        <SkeletonBase type="light" height={108} />
        <SkeletonBase type="light" height={100} />
      </InnerWrapper>
      <SkeletonBase type="light" height={48} borderRadius={12} />
    </SkeletonWrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col bg-neutral-10 gap-20 px-20 py-16 rounded-12
  md:(w-455 gap-24 pt-20 px-24 pb-24)
`;

const SkeletonWrapper = tw.div`
  w-full flex flex-col bg-neutral-10 gap-20 px-20 py-16 rounded-12
  md:(w-455 gap-24 pt-20 px-24 pb-24)
`;

const Header = tw.div`
  flex justify-between items-center gap-10 w-full relative
`;

const InnerWrapper = tw.div`
  flex flex-col gap-16
`;

const ContentWrapper = tw.div`
  flex flex-col gap-8
`;

const SubTitle = tw.div`
  text-neutral-100 font-m-12
`;

const IconWrapper = tw.div`
  clickable w-32 h-32 items-center justify-center flex relative
`;

const Title = tw.div`
  text-neutral-100 font-b-16
`;

const Total = tw.div`
  flex flex-col bg-neutral-15 w-full gap-12 px-20 py-16 rounded-8
`;

const TotalInnerWrapper = tw.div`
  flex justify-between gap-8 h-28
`;

const TotalText = tw.div`
  text-neutral-100 font-r-18
`;

const TotalValueWrapper = tw.div`
  flex gap-8
`;

const TotalValue = tw.div`
  text-neutral-100 font-m-20
`;
