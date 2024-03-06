import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import tw from 'twin.macro';
import { Address, formatUnits, parseEther, parseUnits } from 'viem';
import * as yup from 'yup';

import { useGetMarket } from '~/api/api-contract/_evm/lending/get-market';
import { useGetSupplyCap } from '~/api/api-contract/_evm/lending/get-supply-cap';
import { useSupplyPrepare } from '~/api/api-contract/_evm/lending/supply-substrate';
import { useGetTokenQuery } from '~/api/api-server/token/get-token';

import { COLOR } from '~/assets/colors';
import { IconCancel, IconCheck } from '~/assets/icons';

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

  const { market } = useGetMarket({
    marketAddress: address as Address,
  });
  const symbol = market?.underlyingSymbol;
  const image = market?.underlyingImage;
  const price = market?.price;
  const underlyingDecimals = market?.underlyingDecimals;

  const { supplyCap } = useGetSupplyCap({
    marketAddress: address as Address,
    underlyingDecimals: underlyingDecimals,
  });

  const maxSupply = Number(supplyCap);

  const { data: tokenData } = useGetTokenQuery(
    { queries: { networkAbbr, address: market?.underlyingAsset } },
    { enabled: !!address && !!networkAbbr }
  );
  const { token } = tokenData || {};

  const [inputValue, setInputValue] = useState<number>();
  const [_inputValueRaw, setInputValueRaw] = useState<bigint>();

  const userTokenBalance = market?.underlyingBalance || 0;
  const apy = market?.supplyApy || 0;
  const collateral = (market?.collateralFactorsMantissa || 0n) > 0n;
  const availableSupply = maxSupply;

  const isAvailableSupplyBiggerThanBalance = availableSupply > userTokenBalance;

  const schema = yup.object().shape({
    input: yup
      .number()
      .min(0)
      .max(
        Math.min(userTokenBalance || 0, availableSupply || 0),
        t(isAvailableSupplyBiggerThanBalance ? 'Exceeds wallet balance' : 'Exceeds supply limit')
      )
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
    (inputValue || 0) <= availableSupply;

  const tokenValue = (inputValue || 0) * (price || 0);

  const tokenIn = {
    ...token,
    balance: userTokenBalance,
    amount: inputValue,
    mTokenAddress: address,
  } as IToken & { balance: number; amount: number; mTokenAddress: Address };

  const { isPrepareLoading, isPrepareError } = useSupplyPrepare({
    token: tokenIn,
    enabled: !isFormError && !!tokenIn && !!inputValue && inputValue > 0 && !!address,
  });

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

      <ButtonPrimaryLarge
        text={t('Preview')}
        onClick={() => popupOpen()}
        disabled={!isValidToSupply || isPrepareLoading || isPrepareError}
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
