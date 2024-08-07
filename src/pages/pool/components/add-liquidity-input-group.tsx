import { Suspense, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import tw, { styled } from 'twin.macro';
import { parseUnits } from 'viem';
import * as yup from 'yup';

import { useAddLiquidityPrepare as useAddLiquidityPrepareEvm } from '~/api/api-contract/_evm/pool/add-liquidity-substrate';
import { useUserPoolTokenBalances } from '~/api/api-contract/balance/user-pool-token-balances';
import { useCalculateAddLiquidity } from '~/api/api-contract/pool/calculate-add-liquidity';
import { useGetPoolQuery } from '~/api/api-server/pools/get-pool';

import { IconDown, IconSetting } from '~/assets/icons';

import { Slippage } from '~/components/account';
import { AlertMessage } from '~/components/alerts';
import { ButtonPrimaryLarge, ButtonPrimarySmall } from '~/components/buttons';
import { Checkbox, InputNumber } from '~/components/inputs';
import { SkeletonBase } from '~/components/skeleton/skeleton-base';
import { Tab } from '~/components/tab';
import { Token } from '~/components/token';

import { useGAAction } from '~/hooks/analaystics/ga-action';
import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useOnClickOutside } from '~/hooks/utils';
import { formatNumber, getNetworkAbbr, getNetworkFull, getTokenDecimal } from '~/utils';
import { useAddLiquidityInputGroupTabStore } from '~/states/components/input-group/tab';
import { useAddLiquidityTokenStore } from '~/states/components/input-group/token';
import { IPool, POPUP_ID } from '~/types';

import { useHandleInput } from '../hooks/contexts/use-handle-input';

import { AddLiquidityPopup } from './add-liquidity-popup';
import { AddLiquiditySelectTokenPopup } from './add-liquidity-select-token-popup';

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
  const { gaAction } = useGAAction();

  const ref = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  const [txHash, setTxHash] = useState('');
  const [opened, open] = useState(false);
  const toggle = () => open(!opened);

  const { opened: selectTokenPopupOpened, open: openSelectTokenPopup } = usePopup(
    POPUP_ID.ADD_LIQUIDITY_SELECT_TOKEN
  );

  useOnClickOutside([ref, iconRef], () => open(false));

  const { network, id } = useParams();
  const { selectedNetwork } = useNetwork();
  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const currentNetworkAbbr = getNetworkAbbr(currentNetwork);

  const [inputBlured, inputBlurAll] = useState(false);
  const [inputValues, _setInputValues] = useState<number[]>([0, 0]);
  const [checkedPriceImpact, checkPriceImpact] = useState(false);

  const { t } = useTranslation();

  const tabs = [
    { key: 'double', name: t('Proportional pool tokens deposit') },
    { key: 'single', name: t('Single token deposit') },
  ];
  const { selectedTab, selectTab } = useAddLiquidityInputGroupTabStore();
  const { token: selectedToken, setToken: selectToken } = useAddLiquidityTokenStore();

  const isSingle = selectedTab === 'single';

  const { isXrp } = useNetwork();
  const { opened: popupOpened, open: popupOpen } = usePopup(POPUP_ID.ADD_LP);

  const queryEnabled = !!network && !!id;
  const { data: poolData } = useGetPoolQuery(
    {
      params: {
        networkAbbr: currentNetworkAbbr,
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

  const schema = yup.object().shape({
    input1: yup
      .number()
      .min(0)
      .max(userPoolTokens?.[0]?.balance || 0, t('Exceeds wallet balance'))
      .required(),
    input2: yup
      .number()
      .min(0)
      .max(userPoolTokens?.[1]?.balance || 0, t('Exceeds wallet balance'))
      .required(),
  });
  const { control, setValue, formState } = useForm<InputFormState>({
    resolver: yupResolver(schema),
  });

  const { handleChange, handleTotalMax, isValid, totalValueMaxed, handleOptimize } = useHandleInput(
    {
      pool: pool || ({} as IPool),
      formState,

      inputValues,
      setInputValues: (value: number[]) => _setInputValues(value),
    }
  );

  const ableToAddLiquidityTokens = userPoolTokens.filter(token => token.balance > 0);
  const isValidToAddLiquidity = ableToAddLiquidityTokens.length > 0;

  const totalValue = userPoolTokens.reduce(
    (acc, cur, i) => (acc += (cur.price || 0) * (inputValues[i] || 0)),
    0
  );

  const tokensIn = userPoolTokens.map((token, i) => ({
    ...token,
    amount: inputValues[i],
  }));
  const tokensInBigint =
    tokensIn?.map(t => ({
      ...t,
      amount: parseUnits((t.amount || 0).toFixed(18), getTokenDecimal(currentNetwork, t.symbol)),
    })) ?? [];
  const tokensInValid = tokensIn.filter(token => token.amount > 0).length > 0;

  const { bptOut, priceImpact: priceImpactRaw } = useCalculateAddLiquidity({
    tokensInBigint,
    amountsIn: [inputValues[0], inputValues[1]],
    txHash,
  });

  const priceImpact = hasBalances
    ? priceImpactRaw < 0.01
      ? '< 0.01'
      : formatNumber(priceImpactRaw)
    : '0.00';

  const { isPrepareLoading, isPrepareError, prepareError } = useAddLiquidityPrepareEvm({
    poolId: pool?.poolId || '',
    tokens: tokensInBigint || [],
    enabled: !!pool?.poolId && tokensInValid,
  });

  const errorMessage = prepareError?.message;
  const poolImpactError = errorMessage?.includes('307');

  const errorTitle = t(poolImpactError ? 'Deposit impact too high' : 'Something went wrong');
  const errorDescription = t(
    poolImpactError ? 'deposit-impact-error-message' : 'unknown-error-message'
  );

  const defaultToken = userPoolTokens?.[0];

  useEffect(() => {
    selectToken(defaultToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultToken?.symbol]);

  useEffect(() => {
    _setInputValues([0, 0]);
  }, [isSingle, selectedToken?.symbol]);

  return (
    <Wrapper>
      <Header>
        {isXrp ? (
          <Tab tabs={tabs} selectedTab={selectedTab} onClick={selectTab} />
        ) : (
          <Title>{t('Enter liquidity amount')}</Title>
        )}

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
          {isXrp && <SubTitle>{t('You provide')}</SubTitle>}
          {!isValidToAddLiquidity && (
            <AlertMessage
              title={t(`Insufficient balance`)}
              description={t(`insufficient-balance-message`)}
              type="warning"
            />
          )}
          {isValidToAddLiquidity &&
            userPoolTokens.map((token, idx) => {
              const tokenValue = (token?.price || 0) * (inputValues[idx] || 0);

              if (isSingle && selectedToken?.address !== token?.address) return null;
              return (
                <InputNumber
                  key={token.symbol + idx}
                  name={`input${idx + 1}`}
                  control={control}
                  token={
                    isSingle ? (
                      <Token
                        token={selectedToken?.symbol || defaultToken?.symbol || ''}
                        icon={<IconDown />}
                        image
                        imageUrl={selectedToken?.image || defaultToken?.image || ''}
                      />
                    ) : (
                      <Token token={token.symbol} image imageUrl={token.image} />
                    )
                  }
                  tokenName={token.symbol}
                  tokenValue={token?.price ? tokenValue : undefined}
                  balance={token.balance}
                  handleChange={value => handleChange({ token, value, idx })}
                  handleTokenClick={openSelectTokenPopup}
                  slider={inputValues[idx] > 0}
                  value={inputValues[idx]}
                  setValue={setValue}
                  formState={formState}
                  maxButton
                  blurAll={inputBlurAll}
                  blured={inputBlured}
                  autoFocus={isXrp}
                />
              );
            })}
        </ContentWrapper>

        <ContentWrapper>
          {isXrp && <SubTitle>{t('Summary')}</SubTitle>}
          <Total>
            <TotalInnerWrapper>
              <TotalText>{t`Total liquidity`}</TotalText>
              <TotalValueWrapper>
                <TotalValue>{`$${formatNumber(totalValue)}`}</TotalValue>
                {!(isXrp && isSingle) && (
                  <ButtonPrimarySmall
                    text={totalValueMaxed ? 'Maxed' : 'Max'}
                    onClick={() => {
                      if (!isSingle && ableToAddLiquidityTokens.length <= 1) return;
                      if (isSingle && selectedToken?.balance === 0) return;

                      gaAction({
                        action: 'total-max',
                        buttonType: 'primary-small',
                        data: { page: 'add-liquidity' },
                      });
                      handleTotalMax();
                    }}
                    style={{ width: 'auto' }}
                    isBlack
                    disabled={
                      totalValueMaxed ||
                      !hasBalances ||
                      (!isSingle && ableToAddLiquidityTokens.length <= 1) ||
                      (isSingle && selectedToken?.balance === 0)
                    }
                  />
                )}
              </TotalValueWrapper>
            </TotalInnerWrapper>
            <PriceImpact error={priceImpactRaw >= 3}>
              {`${t('Price impact')} ${priceImpact}%`}
              {!(isXrp && isSingle) && (
                <ButtonWrapper>
                  <ButtonPrimarySmall
                    text={t('Optimize')}
                    onClick={() => {
                      if (!isSingle && ableToAddLiquidityTokens.length <= 1) return;
                      gaAction({
                        action: 'optimize',
                        buttonType: 'primary-small',
                        data: { page: 'add-liquidity' },
                      });
                      handleOptimize();
                    }}
                    isBlack
                    disabled={!hasBalances || (!isSingle && ableToAddLiquidityTokens.length <= 1)}
                  />
                </ButtonWrapper>
              )}
            </PriceImpact>
          </Total>
        </ContentWrapper>
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

      {isPrepareError && (
        <AlertMessage title={errorTitle} description={errorDescription} type="warning" />
      )}

      <ButtonPrimaryLarge
        text={t('Preview')}
        onClick={() => popupOpen()}
        disabled={
          !isValid ||
          !hasBalances ||
          !tokensInValid ||
          (priceImpactRaw > 3 && !checkedPriceImpact) ||
          isPrepareLoading ||
          isPrepareError
        }
      />

      {popupOpened && !isPrepareError && (
        <AddLiquidityPopup
          tokensIn={tokensIn}
          pool={pool}
          lpTokenPrice={lpTokenPrice}
          bptOut={bptOut}
          priceImpact={priceImpact}
          refetchBalance={refetch}
          handleSuccess={(hash: string) => setTxHash(hash)}
        />
      )}

      {selectTokenPopupOpened && (
        <AddLiquiditySelectTokenPopup
          userPoolTokenBalances={userPoolTokens}
          compositions={compositions}
        />
      )}
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

const SlippageWrapper = tw.div`
  absolute top-40 right-0 z-10
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
interface DivProps {
  error?: boolean;
}
const PriceImpact = styled.div<DivProps>(({ error }) => [
  tw`flex justify-between items-center text-neutral-100 font-r-14 whitespace-pre-wrap h-28`,
  error && tw`text-red-50`,
]);

const CheckPriceImpact = tw.div`
  flex gap-16 font-r-14 text-neutral-100
`;
const CheckboxWrapper = tw.div``;

const Text = styled.div<DivProps>(({ error }) => [error && tw`text-red-50`]);
const ButtonWrapper = tw.div``;
