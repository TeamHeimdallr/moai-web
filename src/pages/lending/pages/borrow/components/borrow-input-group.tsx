import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import tw from 'twin.macro';
import { formatUnits, parseEther, parseUnits } from 'viem';
import * as yup from 'yup';

import { useGetTokenQuery } from '~/api/api-server/token/get-token';

import { COLOR } from '~/assets/colors';
import { IconArrowNext } from '~/assets/icons';

import { AlertMessage } from '~/components/alerts';
import { ButtonPrimaryLarge } from '~/components/buttons';
import { Checkbox, InputNumber } from '~/components/inputs';
import { Token } from '~/components/token';

import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { calculateHealthFactorColor, formatNumber, getNetworkAbbr } from '~/utils';
import { IToken, POPUP_ID } from '~/types';

import { LendingBorrowPopup } from './borrow-popup';

interface InputFormState {
  input: number;
}

export const LendingBorrowInputGroup = () => {
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

  const [checkedHealthFactor, checkHealthFactor] = useState(false);

  // TODO: connect API
  const apy = 1.8324;
  const availableBorrow = 10000;
  const currentHealthFactor = 3.8;
  const userTokenBalance = 123123.687598;
  const nextHealthFactor = Math.max(currentHealthFactor - 0.001 * (inputValue || 0), 1);
  // TODO: determine health factor warning threshold
  const threshold = 1.25;
  const currentHealthFactorColor = calculateHealthFactorColor(currentHealthFactor);
  const nextHealthFactorColor = calculateHealthFactorColor(nextHealthFactor);

  const schema = yup.object().shape({
    input: yup
      .number()
      .min(0)
      .max(availableBorrow || 0, t('Exceeds borrow limits'))
      .required(),
  });
  const { control, setValue, formState } = useForm<InputFormState>({
    resolver: yupResolver(schema),
  });

  const { opened: popupOpened, open: popupOpen } = usePopup(POPUP_ID.LENDING_BORROW);

  const isFormError = !!formState?.errors?.input;
  const isValidToBorrow = useMemo(() => {
    if (!inputValue) return false;
    if (nextHealthFactor <= threshold && !checkedHealthFactor) return false;

    if (!isFormError && inputValue > 0 && inputValue <= availableBorrow) return true;
  }, [checkedHealthFactor, inputValue, isFormError, nextHealthFactor]);

  const tokenValue = (inputValue || 0) * (price || 0);

  const tokenIn = { ...token, amount: inputValue } as IToken & { amount: number };

  // TODO: prepare

  return (
    <Wrapper>
      <Header>
        <Title>{t('Enter borrow amount')}</Title>
      </Header>

      <InnerWrapper>
        <InputNumber
          key={symbol}
          name="input"
          control={control}
          token={<Token token={symbol || ''} image imageUrl={image} />}
          tokenName={symbol}
          tokenValue={tokenValue}
          balanceLabel="Available"
          balance={availableBorrow}
          balanceRaw={parseEther(availableBorrow.toString())}
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
          <InfoBase>
            <InfoText>{t('Borrow APY')}</InfoText>
            <InfoText>{`${formatNumber(apy)}%`}</InfoText>
          </InfoBase>

          <HealthFactorWrapper>
            <InfoText>{t('Health factor')}</InfoText>
            <HealthFactorInnerWrapper>
              <HealthFactorCard>
                {t('Current')}
                <HealthFactorCardValue style={{ color: currentHealthFactorColor }}>
                  {formatNumber(currentHealthFactor)}
                </HealthFactorCardValue>
              </HealthFactorCard>

              <HealthFactorIcon>
                <IconArrowNext width={20} height={20} fill={COLOR.NEUTRAL[60]} />
              </HealthFactorIcon>

              <HealthFactorCard>
                {t('After transaction')}
                <HealthFactorCardValue style={{ color: nextHealthFactorColor }}>
                  {formatNumber(nextHealthFactor)}
                </HealthFactorCardValue>
              </HealthFactorCard>
            </HealthFactorInnerWrapper>
            <HealthFactorCaption>{t('liquidation-at', { threshold })}</HealthFactorCaption>
          </HealthFactorWrapper>
        </InfoWrapper>
      </InnerWrapper>

      {nextHealthFactor <= threshold && (
        <AlertMessage
          title={t('health-factor-warning-title', { threshold: '1.0' })}
          description={t('health-factor-warning-description', { action: 'Borrowing' })}
          type="error"
        />
      )}

      {nextHealthFactor <= threshold && (
        <CheckHealthFactor>
          <Checkbox
            onClick={() => checkHealthFactor(prev => !prev)}
            selected={checkedHealthFactor}
          />
          {t('health-factor-warning-accept')}
        </CheckHealthFactor>
      )}

      <ButtonPrimaryLarge
        text={t('Preview')}
        onClick={() => popupOpen()}
        disabled={!isValidToBorrow}
      />

      {popupOpened && (
        <LendingBorrowPopup
          tokenIn={tokenIn}
          apy={apy}
          currentHealthFactor={currentHealthFactor}
          nextHealthFactor={nextHealthFactor}
          availableBorrow={availableBorrow}
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

const InfoBase = tw.div`
  flex gap-8 items-center justify-between
`;

const InfoText = tw.div`
  font-r-14 text-neutral-100 flex gap-4
`;

const HealthFactorWrapper = tw.div`
  flex flex-col gap-8
`;

const HealthFactorInnerWrapper = tw.div`
  flex gap-8 items-center justify-between
`;

const HealthFactorCard = tw.div`
  px-16 py-8 rounded-10 bg-neutral-20 flex-1 flex flex-col font-r-12 text-neutral-80 leading-18
`;
const HealthFactorCardValue = tw.div`
  font-b-14
`;

const HealthFactorIcon = tw.div`
  flex-center w-20 h-20 flex-shrink-0
`;

const HealthFactorCaption = tw.div`
  font-r-12 text-neutral-80 w-full text-right leading-18
`;
const CheckHealthFactor = tw.div`
  flex gap-16 font-r-14 text-neutral-100
`;
