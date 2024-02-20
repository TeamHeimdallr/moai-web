import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import { isFinite } from 'lodash-es';
import tw from 'twin.macro';
import { formatUnits, parseEther, parseUnits } from 'viem';
import * as yup from 'yup';

import { useGetTokenQuery } from '~/api/api-server/token/get-token';

import { COLOR } from '~/assets/colors';
import { IconArrowNext, IconInfinity } from '~/assets/icons';

import { MILLION } from '~/constants';

import { ButtonPrimaryLarge } from '~/components/buttons';
import { InputNumber } from '~/components/inputs';
import { Token } from '~/components/token';

import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { calculateHealthFactorColor, formatNumber, getNetworkAbbr } from '~/utils';
import { IToken, POPUP_ID } from '~/types';

import { LendingRepayPopup } from './repay-popup';

interface InputFormState {
  input: number;
}

export const LendingRepayInputGroup = () => {
  const { address } = useParams();
  const { selectedNetwork } = useNetwork();

  const { t } = useTranslation();

  const networkAbbr = getNetworkAbbr(selectedNetwork);

  const { data: tokenData } = useGetTokenQuery(
    { queries: { networkAbbr, address: address } },
    { enabled: !!address && !!networkAbbr }
  );
  const { token } = tokenData || {};
  const { symbol, image, price } = token || {};

  const [inputValue, setInputValue] = useState<number>();
  const [_inputValueRaw, setInputValueRaw] = useState<bigint>();

  // TODO: connect API
  const totalDebt = 150230;
  const debt = 150230;
  const currentHealthFactor = 3.8;
  const userTokenBalance = 123123.687598;
  const nextHealthFactor =
    totalDebt - (inputValue || 0) === 0
      ? Infinity
      : Math.max(currentHealthFactor + 0.001 * (inputValue || 0), 1);

  const currentHealthFactorColor = calculateHealthFactorColor(currentHealthFactor);
  const nextHealthFactorColor = calculateHealthFactorColor(nextHealthFactor);

  const schema = yup.object().shape({
    input: yup
      .number()
      .min(0)
      .max(debt || 0, t('Exceeds borrow balance'))
      .required(),
  });
  const { control, setValue, formState } = useForm<InputFormState>({
    resolver: yupResolver(schema),
  });

  const { opened: popupOpened, open: popupOpen } = usePopup(POPUP_ID.LENDING_REPAY);

  const isFormError = !!formState?.errors?.input;
  const isValidToRepay = useMemo(() => {
    if (!inputValue) return false;
    if (!isFormError && inputValue > 0 && inputValue <= debt) return true;
  }, [inputValue, isFormError]);

  const tokenValue = (inputValue || 0) * (price || 0);
  const tokenIn = { ...token, amount: inputValue } as IToken & { amount: number };

  // TODO: prepare

  return (
    <Wrapper>
      <Header>
        <Title>{t('Enter repayment amount')}</Title>
      </Header>

      <InnerWrapper>
        <InputNumber
          key={symbol}
          name="input"
          control={control}
          token={<Token token={symbol || ''} image imageUrl={image} />}
          tokenName={symbol}
          tokenValue={tokenValue}
          balanceLabel="Borrow balance"
          balance={debt}
          balanceRaw={parseEther(debt.toString())}
          value={inputValue}
          handleChange={val => {
            setInputValue(val);
            setInputValueRaw(parseUnits((val || 0).toFixed(18), 18));
          }}
          handleChangeRaw={val => {
            setInputValue(Number(formatUnits(val || 0n, 18)));
            setInputValueRaw(val);
          }}
          maxButton
          slider
          sliderActive
          setValue={setValue}
          formState={formState}
        />
        <InfoWrapper>
          <InfoCardWrapper>
            <InfoText>{t('Remaining debt')}</InfoText>
            <InfoCardInnerWrapper>
              <InfoCard>
                {t('Current')}
                <InfoCardValueBold>
                  {`${formatNumber(debt, 2, 'floor', MILLION, 2)} ${symbol}`}
                </InfoCardValueBold>
                <InfoCardValue>
                  {`$${formatNumber(debt * (price || 0), 2, 'floor', MILLION, 2)}`}
                </InfoCardValue>
              </InfoCard>

              <ArrowRightIcon>
                <IconArrowNext width={20} height={20} fill={COLOR.NEUTRAL[60]} />
              </ArrowRightIcon>

              <InfoCard>
                {t('After transaction')}
                <InfoCardValueBold>
                  {`${formatNumber(debt - (inputValue || 0), 2, 'floor', MILLION, 2)} ${symbol}`}
                </InfoCardValueBold>
                <InfoCardValue>
                  {`$${formatNumber(
                    (debt - (inputValue || 0)) * (price || 0),
                    2,
                    'floor',
                    MILLION,
                    2
                  )}`}
                </InfoCardValue>
              </InfoCard>
            </InfoCardInnerWrapper>
          </InfoCardWrapper>

          <InfoCardWrapper>
            <InfoText>{t('Health factor')}</InfoText>
            <InfoCardInnerWrapper>
              <InfoCard>
                {t('Current')}
                <InfoCardValueBold style={{ color: currentHealthFactorColor }}>
                  {formatNumber(currentHealthFactor)}
                </InfoCardValueBold>
              </InfoCard>

              <ArrowRightIcon>
                <IconArrowNext width={20} height={20} fill={COLOR.NEUTRAL[60]} />
              </ArrowRightIcon>

              <InfoCard>
                {t('After transaction')}
                <InfoCardValueBold style={{ color: nextHealthFactorColor }}>
                  {isFinite(nextHealthFactor) ? (
                    formatNumber(nextHealthFactor)
                  ) : (
                    <IconInfinity width={20} height={22} fill={COLOR.GREEN[50]} />
                  )}
                </InfoCardValueBold>
              </InfoCard>
            </InfoCardInnerWrapper>
            <InfoCaption>{t('liquidation-at', { threshold: '1.0' })}</InfoCaption>
          </InfoCardWrapper>
        </InfoWrapper>
      </InnerWrapper>

      <ButtonPrimaryLarge
        text={t('Preview')}
        onClick={() => popupOpen()}
        disabled={!isValidToRepay}
      />

      {popupOpened && (
        <LendingRepayPopup
          tokenIn={tokenIn}
          currentHealthFactor={currentHealthFactor}
          nextHealthFactor={nextHealthFactor}
          debt={debt}
          userTokenBalance={userTokenBalance}
          handleSuccess={() => {}}
        />
      )}
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col bg-neutral-10 gap-20 px-20 py-16 rounded-12
  md:(w-455 gap-24 pt-20 px-24 pb-24)
`;

const Header = tw.div`
  flex justify-between items-center gap-10 w-full relative
`;

const InnerWrapper = tw.div`
  flex flex-col gap-16
`;

const Title = tw.div`
  text-neutral-100 font-b-16
`;

const InfoWrapper = tw.div`
  px-20 py-16 bg-neutral-15 rounded-8 flex flex-col gap-12
`;

const InfoText = tw.div`
  font-r-14 text-neutral-100 flex gap-4
`;

const InfoCardWrapper = tw.div`
  flex flex-col gap-8
`;

const InfoCardInnerWrapper = tw.div`
  flex gap-8 items-center justify-between
`;

const InfoCard = tw.div`
  px-16 py-8 rounded-10 bg-neutral-20 flex-1 flex flex-col font-r-12 text-neutral-80 leading-18
`;

const InfoCardValueBold = tw.div`
  font-b-14 text-neutral-100 flex items-center
`;
const InfoCardValue = tw.div`
  font-r-12 flex items-center
`;

const ArrowRightIcon = tw.div`
  flex-center w-20 h-20 flex-shrink-0
`;

const InfoCaption = tw.div`
  font-r-12 text-neutral-80 w-full text-right leading-18
`;
