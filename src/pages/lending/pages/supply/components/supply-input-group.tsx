import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import tw from 'twin.macro';
import { formatUnits, parseEther, parseUnits } from 'viem';
import * as yup from 'yup';

import { useGetTokenQuery } from '~/api/api-server/token/get-token';

import { COLOR } from '~/assets/colors';
import { IconCancel, IconCheck } from '~/assets/icons';

import { AlertMessage } from '~/components/alerts';
import { ButtonPrimaryLarge } from '~/components/buttons';
import { InputNumber } from '~/components/inputs';
import { Token } from '~/components/token';

import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { formatNumber, getNetworkAbbr } from '~/utils';
import { IToken, POPUP_ID } from '~/types';

import { LendingSupplyPopup } from './supply-popup';

interface InputFormState {
  input: number;
}

export const LendingSupplyInputGroup = () => {
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
  const userTokenBalance = 123123.687598;
  const apy = 1.8324;
  const collateral = true;
  const availableSupply = 10000;

  const schema = yup.object().shape({
    input: yup
      .number()
      .min(0)
      .max(userTokenBalance || 0, t('Exceeds wallet balance'))
      .required(),
  });
  const { control, setValue, formState } = useForm<InputFormState>({
    resolver: yupResolver(schema),
  });

  const { opened: popupOpened, open: popupOpen } = usePopup(POPUP_ID.LENDING_SUPPLY);

  const isFormError = !!formState?.errors?.input;
  const isValidToSupply =
    !isFormError &&
    (inputValue || 0) > 0 &&
    (inputValue || 0) <= userTokenBalance &&
    (inputValue || 0) < availableSupply;

  const tokenValue = (inputValue || 0) * (price || 0);

  const tokenIn = {
    ...token,
    balance: userTokenBalance,
    amount: inputValue,
  } as IToken & { balance: number; amount: number };
  // TODO: prepare

  return (
    <Wrapper>
      <Header>
        <Title>{t('Enter supply amount')}</Title>
      </Header>

      <InnerWrapper>
        <InputNumber
          key={symbol}
          name="input"
          control={control}
          token={<Token token={symbol || ''} image imageUrl={image} />}
          tokenName={symbol}
          tokenValue={tokenValue}
          balance={userTokenBalance}
          balanceRaw={parseEther(userTokenBalance.toString())}
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
            <InfoText>{t('Supply APY')}</InfoText>
            <InfoText>{`${formatNumber(apy)}%`}</InfoText>
          </InfoBase>
          <InfoBase>
            <InfoText>{t('Collateralization')}</InfoText>
            <InfoText style={{ color: collateral ? COLOR.GREEN[50] : COLOR.RED[50] }}>
              {collateral ? (
                <IconCheck width={20} height={20} fill={COLOR.GREEN[50]} />
              ) : (
                <IconCancel width={20} height={20} fill={COLOR.RED[50]} />
              )}
              {collateral ? t('Can be collateral') : t('Can not be collateral')}
            </InfoText>
          </InfoBase>
        </InfoWrapper>
      </InnerWrapper>

      {(inputValue || 0) > availableSupply && (
        <AlertMessage title={'title'} description={'desc'} type="error" />
      )}

      <ButtonPrimaryLarge
        text={t('Preview')}
        onClick={() => popupOpen()}
        disabled={!isValidToSupply}
      />

      {popupOpened && (
        <LendingSupplyPopup
          tokenIn={tokenIn}
          userTokenBalance={userTokenBalance}
          apy={apy}
          collateral={collateral}
          availableSupply={availableSupply}
          refetchBalance={() => {}}
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
  px-20 py-16 bg-neutral-15 rounded-8 flex flex-col gap-16
`;

const InfoBase = tw.div`
  flex gap-8 items-center justify-between
`;

const InfoText = tw.div`
  font-r-14 text-neutral-100 flex gap-4
`;
