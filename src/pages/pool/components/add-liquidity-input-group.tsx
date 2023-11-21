import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import tw, { styled } from 'twin.macro';
import * as yup from 'yup';

import { useUserPoolTokenBalances } from '~/api/api-contract/balance/user-pool-token-balances';
import { useCalculateAddLiquidity } from '~/api/api-contract/pool/calculate-add-liquidity';
import { useGetPoolQuery } from '~/api/api-server/pools/get-pool';

import { IconSetting } from '~/assets/icons';

import { Slippage } from '~/components/account';
import { AlertMessage } from '~/components/alerts';
import { ButtonPrimaryLarge, ButtonPrimarySmall } from '~/components/buttons';
import { Checkbox, InputNumber } from '~/components/inputs';
import { Token } from '~/components/token';

import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useOnClickOutside } from '~/hooks/utils';
import { formatNumber } from '~/utils';
import { IPool, POPUP_ID } from '~/types';

import { useHandleInput } from '../hooks/contexts/use-handle-input';

import { AddLiquidityPopup } from './add-liquidity-popup';

interface InputFormState {
  input1: number;
  input2: number;
}
export const AddLiquidityInputGroup = () => {
  const ref = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  const [opened, open] = useState(false);
  const toggle = () => open(!opened);

  useOnClickOutside([ref, iconRef], () => open(false));

  const { network, id } = useParams();

  const [inputBlured, inputBlurAll] = useState(false);
  const [inputValue1, setInputValue1] = useState<number>(0);
  const [inputValue2, setInputValue2] = useState<number>(0);
  const [checkedPriceImpact, checkPriceImpact] = useState(false);

  const { t } = useTranslation();

  const { isXrp } = useNetwork();
  const { opened: popupOpened, open: popupOpen } = usePopup(POPUP_ID.ADD_LP);

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
  const { compositions } = pool || {};

  const { lpTokenPrice, userPoolTokens, refetch } = useUserPoolTokenBalances();
  const hasBalances = userPoolTokens.length > 0 && userPoolTokens.some(token => token.balance > 0);

  const { bptOut, priceImpact: priceImpactRaw } = useCalculateAddLiquidity({
    amountsIn: [inputValue1, inputValue2],
  });
  const priceImpact = hasBalances
    ? priceImpactRaw < 0.01
      ? '< 0.01'
      : formatNumber(priceImpactRaw, 2)
    : '0.00';

  const schema = yup.object().shape({
    input1: yup
      .number()
      .min(0)
      .max(userPoolTokens?.[0]?.balance ?? 0, t('Exceeds wallet balance'))
      .required(),
    input2: yup
      .number()
      .min(0)
      .max(userPoolTokens?.[1]?.balance ?? 0, t('Exceeds wallet balance'))
      .required(),
  });
  const { control, setValue, formState } = useForm<InputFormState>({
    resolver: yupResolver(schema),
  });

  const getInputValue = (token: string) => {
    if (token === compositions?.[0]?.symbol) return inputValue1;
    if (token === compositions?.[1]?.symbol) return inputValue2;
    return 0;
  };

  const { handleChange, handleTotalMax, isValid, totalValueMaxed, handleOptimize } = useHandleInput(
    {
      pool: pool || ({} as IPool),
      formState,

      getInputValue,
      setInputValue1,
      setInputValue2,
    }
  );

  const ableToAddLiquidityTokens = userPoolTokens.filter(token => token.balance > 0);
  const getIsValidToAddLiquidity = () => {
    if (isXrp) {
      if (!compositions) return;
      return ableToAddLiquidityTokens.length === compositions.length; // in xrp, should have all pool token balances to add liquidity
    }

    return ableToAddLiquidityTokens.length > 0; // in evm, should have at least one pool token balance to add liquidity
  };
  const isValidToAddLiquidity = getIsValidToAddLiquidity();

  const totalValue = userPoolTokens.reduce(
    (acc, cur) => (acc += (cur.price || 0) * (getInputValue(cur.symbol) || 0)),
    0
  );
  const tokensIn = userPoolTokens.map(token => ({
    ...token,
    amount: getInputValue(token.symbol),
  }));
  const tokensInValid = tokensIn.filter(token => token.amount > 0).length > 0;

  return (
    <Wrapper>
      <Header>
        <Title>{t('Enter liquidity amount')}</Title>

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
        {!isValidToAddLiquidity && (
          <AlertMessage
            title={t(`Insufficient balance`)}
            description={t(`insufficient-balance-message`)}
            type="warning"
          />
        )}
        {isValidToAddLiquidity &&
          userPoolTokens.map((token, idx) => {
            const tokenValue = (token?.price || 0) * (getInputValue(token?.symbol) || 0);
            if (token.balance === 0) {
              return (
                <NoBalanceAlert key={token.symbol}>
                  {t('No wallet balance for some pool tokens')} {token.symbol}
                </NoBalanceAlert>
              );
            }
            return (
              <InputNumber
                key={token.symbol + idx}
                name={`input${idx + 1}`}
                control={control}
                token={<Token token={token.symbol} image imageUrl={token.image} />}
                tokenName={token.symbol}
                tokenValue={tokenValue}
                balance={token.balance}
                handleChange={value => handleChange({ token, value, idx })}
                slider={getInputValue(token.symbol) > 0}
                value={getInputValue(token.symbol)}
                setValue={setValue}
                formState={formState}
                maxButton
                blurAll={inputBlurAll}
                blured={inputBlured}
                autoFocus={isXrp}
              />
            );
          })}

        <Total>
          <TotalInnerWrapper>
            <TotalText>{t`Total liquidity`}</TotalText>
            <TotalValueWrapper>
              <TotalValue>{`$${formatNumber(totalValue, 2)}`}</TotalValue>
              <ButtonPrimarySmall
                text={totalValueMaxed ? 'Maxed' : 'Max'}
                onClick={handleTotalMax}
                style={{ width: 'auto' }}
                disabled={totalValueMaxed || !hasBalances}
              />
            </TotalValueWrapper>
          </TotalInnerWrapper>
          <PriceImpact error={priceImpactRaw >= 3}>
            {`${t('Price impact')} ${priceImpact}%`}
            <ButtonWrapper>
              <ButtonPrimarySmall
                disabled={isXrp || !hasBalances}
                text={'Optimize'}
                onClick={handleOptimize}
              />
            </ButtonWrapper>
          </PriceImpact>
        </Total>
      </InnerWrapper>

      {priceImpactRaw > 3 && (
        <CheckPriceImpact>
          <CheckboxWrapper>
            <Checkbox
              onClick={() => checkPriceImpact(prev => !prev)}
              selected={checkedPriceImpact}
            />
          </CheckboxWrapper>
          <Text>
            <Text>{t('accept-high-price-impact-message')}</Text>
          </Text>
        </CheckPriceImpact>
      )}

      <ButtonPrimaryLarge
        text={t('Preview')}
        onClick={popupOpen}
        disabled={
          !isValid || !hasBalances || !tokensInValid || (priceImpactRaw > 3 && !checkedPriceImpact)
        }
      />

      {popupOpened && (
        <AddLiquidityPopup
          tokensIn={tokensIn}
          pool={pool}
          lpTokenPrice={lpTokenPrice}
          bptOut={bptOut}
          priceImpact={priceImpact}
          refetchBalance={refetch}
        />
      )}
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col bg-neutral-10 gap-20 px-20 py-16 rounded-12
  md:(w-452 gap-24 pt-20 px-24 pb-24)
`;

const Header = tw.div`
  flex justify-between items-center gap-10 w-full relative
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

const Title = tw.div`
  text-neutral-100 font-b-16
`;

const Total = tw.div`
  flex flex-col bg-neutral-15 w-full gap-12 px-20 py-16 rounded-8
`;

const TotalInnerWrapper = tw.div`
  flex justify-between gap-8
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
interface DivProps {
  error?: boolean;
}
const PriceImpact = styled.div<DivProps>(({ error }) => [
  tw`flex justify-between items-center text-neutral-100 font-r-14 whitespace-pre-wrap`,
  error && tw`text-red-50`,
]);

const NoBalanceAlert = tw.div`
  font-r-14 text-neutral-70
`;
const CheckPriceImpact = tw.div`
  flex gap-16 font-r-14 text-neutral-100
`;
const CheckboxWrapper = tw.div``;

const Text = styled.div<DivProps>(({ error }) => [error && tw`text-red-50`]);
const ButtonWrapper = tw.div``;
