import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import tw from 'twin.macro';
import { Address, formatUnits, parseEther, parseUnits } from 'viem';
import * as yup from 'yup';

import { useGetAllMarkets } from '~/api/api-contract/lending/get-all-markets';
import { useUserAccountSnapshot } from '~/api/api-contract/lending/user-account-snapshot';
import { useUserAccountSnapshotAll } from '~/api/api-contract/lending/user-account-snapshot-all';
import { useGetTokenQuery } from '~/api/api-server/token/get-token';

import { COLOR } from '~/assets/colors';
import { IconArrowNext } from '~/assets/icons';

import { MILLION } from '~/constants';

import { AlertMessage } from '~/components/alerts';
import { ButtonPrimaryLarge } from '~/components/buttons';
import { Checkbox, InputNumber } from '~/components/inputs';
import { Token } from '~/components/token';

import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { calculateHealthFactorColor, formatNumber, getNetworkAbbr } from '~/utils';
import { calcHealthFactor } from '~/utils/util-lending';
import { IToken, POPUP_ID } from '~/types';

import { LendingWithdrawPopup } from './withdraw-popup';

interface InputFormState {
  input: number;
}

export const LendingWithdrawInputGroup = () => {
  const { address } = useParams();
  const { selectedNetwork } = useNetwork();

  const { t } = useTranslation();

  const networkAbbr = getNetworkAbbr(selectedNetwork);

  const { markets } = useGetAllMarkets();
  const market = markets.find(m => m.address === address);
  const symbol = market?.underlyingSymbol;
  const image = market?.underlyingImage;
  const price = market?.price;

  const { accountSnapshot } = useUserAccountSnapshot({
    mTokenAddress: (address ?? '0x0') as Address,
  });
  const { accountSnapshots: snapshotsAll } = useUserAccountSnapshotAll();

  const { data: tokenData } = useGetTokenQuery(
    { queries: { networkAbbr, address: market?.underlyingAsset } },
    { enabled: !!address && !!networkAbbr }
  );
  const { token } = tokenData || {};

  const [inputValue, setInputValue] = useState<number>();
  const [_inputValueRaw, setInputValueRaw] = useState<bigint>();

  const [checkedHealthFactor, checkHealthFactor] = useState(false);

  const userTokenBalance = market?.underlyingBalance || 0;
  const currentHealthFactor = calcHealthFactor({
    markets,
    snapshots: snapshotsAll,
  });

  const nextHealthFactor = calcHealthFactor({
    markets,
    snapshots: snapshotsAll,
    deltaSupply: {
      marketAddress: address as Address,
      delta: parseUnits(inputValue?.toString() || '0', market?.underlyingDecimals || 18),
      isWithdraw: true,
    },
  });

  const supplied = Number(
    formatUnits(accountSnapshot.mTokenBalance * accountSnapshot.exchangeRate, 16 + 8)
  );
  // TODO: determine health factor warning threshold
  const threshold = 1.25;
  const currentHealthFactorColor = calculateHealthFactorColor(currentHealthFactor);
  const nextHealthFactorColor = calculateHealthFactorColor(nextHealthFactor);

  const schema = yup.object().shape({
    input: yup
      .number()
      .min(0)
      .max(supplied || 0, t('Exceeds supply limits'))
      .required(),
  });
  const { control, setValue, formState } = useForm<InputFormState>({
    resolver: yupResolver(schema),
  });

  const { opened: popupOpened, open: popupOpen } = usePopup(POPUP_ID.LENDING_WITHDRAW);

  const isFormError = !!formState?.errors?.input;
  const isValidToWithdraw = useMemo(() => {
    if (!inputValue) return false;
    if (nextHealthFactor <= threshold && !checkedHealthFactor) return false;

    if (!isFormError && inputValue > 0 && inputValue <= supplied) return true;
  }, [checkedHealthFactor, inputValue, isFormError, nextHealthFactor, supplied]);

  const tokenValue = (inputValue || 0) * (price || 0);

  const tokenIn = {
    ...token,
    amount: inputValue,
    mTokenAddress: address,
  } as IToken & {
    amount: number;
    mTokenAddress: Address;
  };

  // TODO: prepare

  return (
    <Wrapper>
      <Header>
        <Title>{t('Enter withdrawal amount')}</Title>
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
          balance={supplied}
          balanceRaw={parseEther(supplied.toString())}
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
            <InfoText>{t('Remaining supply')}</InfoText>
            <InfoText>{`${formatNumber(
              supplied - (inputValue || 0),
              2,
              'floor',
              MILLION,
              2
            )} ${symbol}`}</InfoText>
          </InfoBase>

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
                  {formatNumber(nextHealthFactor)}
                </InfoCardValueBold>
              </InfoCard>
            </InfoCardInnerWrapper>
            <InfoCaption>{t('liquidation-at', { threshold: '1.0' })}</InfoCaption>
          </InfoCardWrapper>
        </InfoWrapper>
      </InnerWrapper>

      {nextHealthFactor <= threshold && (
        <AlertMessage
          title={t('health-factor-warning-title', { threshold: '1.0' })}
          description={t('health-factor-warning-description', { action: 'Withdrawing' })}
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
        disabled={!isValidToWithdraw}
      />

      {popupOpened && (
        <LendingWithdrawPopup
          tokenIn={tokenIn}
          currentHealthFactor={currentHealthFactor}
          nextHealthFactor={nextHealthFactor}
          supplied={supplied}
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
  font-b-14 text-neutral-100
`;

const ArrowRightIcon = tw.div`
  flex-center w-20 h-20 flex-shrink-0
`;

const InfoCaption = tw.div`
  font-r-12 text-neutral-80 w-full text-right leading-18
`;

const CheckHealthFactor = tw.div`
  flex gap-16 font-r-14 text-neutral-100
`;
