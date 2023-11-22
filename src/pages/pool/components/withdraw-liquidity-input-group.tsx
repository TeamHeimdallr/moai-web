import { Fragment, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import tw from 'twin.macro';
import * as yup from 'yup';

import { useUserPoolTokenBalances } from '~/api/api-contract/balance/user-pool-token-balances';
import { useCalculateWithdrawLiquidity } from '~/api/api-contract/pool/calculate-withdraw-liquidity';
import { useGetPoolQuery } from '~/api/api-server/pools/get-pool';

import { IconSetting } from '~/assets/icons';

import { Slippage } from '~/components/account';
import { ButtonPrimaryLarge } from '~/components/buttons';
import { InputNumber } from '~/components/inputs';
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
  const ref = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  const [opened, open] = useState(false);
  const toggle = () => open(!opened);

  useOnClickOutside([ref, iconRef], () => open(false));

  const { network, id } = useParams();
  const { t } = useTranslation();

  const [inputValue, setInputValue] = useState<number>();

  const tabs = [
    { key: 'proportional', name: t('Proportional pool tokens') },
    { key: 'single', name: t('Single token'), disabled: true },
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

  const { lpTokenPrice, userLpTokenBalance, refetch } = useUserPoolTokenBalances();
  const { proportionalTokensOut, priceImpact: priceImpactRaw } = useCalculateWithdrawLiquidity({
    bptIn: inputValue || 0,
  });
  const priceImpact = priceImpactRaw < 0.01 ? '< 0.01' : formatNumber(priceImpactRaw, 2);
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
            token={<Token token={lpToken?.symbol || ''} image address={lpToken?.address} />}
            tokenName={lpToken?.symbol || ''}
            tokenValue={withdrawTokenValue}
            balance={userLpTokenBalance || 0}
            value={inputValue}
            handleChange={val => setInputValue(val)}
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
                    title={`${formatNumber(amount, 6)} ${symbol}`}
                    description={`$${formatNumber(amount * (price || 0), 2)}`}
                    image={image}
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

      <ButtonPrimaryLarge text={t('Preview')} onClick={popupOpen} disabled={!isValidToWithdraw} />

      {popupOpened && (
        <WithdrawLiquidityPopup
          pool={pool}
          tokensOut={proportionalTokensOut}
          lpTokenPrice={lpTokenPrice}
          bptIn={inputValue || 0}
          priceImpact={priceImpact}
          withdrawTokenWeight={withdrawTokenWeight}
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
  flex w-full justify-between items-center gap-12
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
