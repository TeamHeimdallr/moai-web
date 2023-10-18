import { Fragment, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import tw from 'twin.macro';
import { Address } from 'wagmi';
import * as yup from 'yup';

import { useWithdrawTokenAmounts } from '~/api/api-contract/_evm/pool/get-liquidity-pool-balance';

import { TOKEN_DESCRIPTION_MAPPER, TOKEN_IMAGE_MAPPER } from '~/constants';

import { ButtonPrimaryLarge } from '~/components/buttons';
import { InputNumber } from '~/components/inputs';
import { Tab } from '~/components/tab';
import { Token } from '~/components/token';
import { TokenList } from '~/components/token-list';

import { usePopup } from '~/hooks/components';
import { formatNumber } from '~/utils';
import { useWithdrawLiquidityInputGroupTabStore } from '~/states/components/input-group/tab';
import { IPool, POPUP_ID } from '~/types';

import { WithdrawLiquidityPopup } from './withdraw-liquidity-popup';

interface InputFormState {
  input1: number;
}
interface Props {
  pool: IPool;
  lpTokenBalance: number;
  lpTokenTotalSupply: number;
}
export const WithdrawLiquidityInputGroup = ({
  pool,
  lpTokenBalance,
  lpTokenTotalSupply,
}: Props) => {
  // const ref = useRef<HTMLDivElement>(null);
  // const iconRef = useRef<HTMLDivElement>(null);

  const [inputValue, setInputValue] = useState<number>();

  const { opened: popupOpened, open: popupOpen } = usePopup(POPUP_ID.WITHDRAW_LP);
  const { compositions } = pool;

  const tabs = [
    { key: 'proportional', name: 'Proportional pool tokens' },
    { key: 'single', name: 'Single token', disabled: true },
  ];
  const { selectedTab, selectTab } = useWithdrawLiquidityInputGroupTabStore();

  const { amountsOut, priceImpact: priceImpactRaw } = useWithdrawTokenAmounts({
    poolId: pool.id as Address,
    bptIn: inputValue ?? 0,
  });

  const priceImpact = priceImpactRaw < 0.01 ? '< 0.01' : formatNumber(priceImpactRaw, 2);

  // const [opened, open] = useState(false);
  // const toggle = () => open(!opened);

  // useOnClickOutside([ref, iconRef], () => settingOpen(false));
  const withdrawTokenValue =
    (inputValue ?? 0) * (lpTokenTotalSupply ? (pool.value ?? 0) / lpTokenTotalSupply : 0);

  const schema = yup.object().shape({
    input1: yup
      .number()
      .min(0)
      .max(lpTokenBalance ?? 0, 'Exceeds wallet balance')
      .required(),
  });
  const { control, setValue, formState } = useForm<InputFormState>({
    resolver: yupResolver(schema),
  });

  const isFormError = formState?.errors?.input1 !== undefined;
  const isValid = isFormError || !inputValue || inputValue <= lpTokenBalance;

  return (
    <Wrapper>
      <Header>
        <Tab tabs={tabs} selectedTab={selectedTab} onClick={selectTab} />
        {/* <IconWrapper onClick={toggle} ref={iconRef}>
          <IconSetting fill={settingOpened ? '#F5FF83' : '#9296AD'} width={20} height={20} />
        </IconWrapper>
        {settingOpened && (
          <SlippageWrapper ref={ref}>
            <Slippage shadow />
          </SlippageWrapper>
        )} */}
      </Header>
      <InnerWrapper>
        <ContentWrapper>
          <SubTitle>You provide</SubTitle>
          <InputNumber
            token={<Token token={pool.lpTokenName} />}
            tokenName={pool.lpTokenName}
            tokenValue={withdrawTokenValue}
            balance={lpTokenBalance}
            value={inputValue}
            handleChange={val => setInputValue(val)}
            maxButton
            slider
            sliderActive
            name={'input1'}
            control={control}
            setValue={setValue}
            formState={formState}
          />
        </ContentWrapper>
        <ContentWrapper>
          <SubTitle>You receive</SubTitle>
          <TokenListWrapper>
            {compositions.map(({ symbol, weight }, i) => (
              <Fragment key={symbol + i}>
                <TokenList
                  type="large"
                  title={`${symbol} ${amountsOut[i].toFixed(4)} (${weight}%)`}
                  description={`${TOKEN_DESCRIPTION_MAPPER[symbol]}`}
                  image={TOKEN_IMAGE_MAPPER[symbol]}
                  leftAlign={true}
                />
                {i !== compositions.length - 1 && <Divider />}
              </Fragment>
            ))}
          </TokenListWrapper>
        </ContentWrapper>
        <PriceImpaceWrapper>
          <PriceImpact>Price impact</PriceImpact>
          <PriceImpact>{`< ${formatNumber(priceImpact)}%`}</PriceImpact>
        </PriceImpaceWrapper>
      </InnerWrapper>

      <ButtonPrimaryLarge text="Preview" onClick={popupOpen} disabled={!isValid} />

      {popupOpened && (
        <WithdrawLiquidityPopup
          pool={pool}
          inputValue={inputValue ?? 0}
          lpTokenBalance={lpTokenBalance}
          tokenValue={withdrawTokenValue}
          priceImpact={priceImpact}
          amountsOut={amountsOut}
        />
      )}
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col bg-neutral-10 gap-24 px-24 py-20 rounded-12 w-452
`;

const Header = tw.div`
  flex justify-between items-center gap-10 w-full relative
`;

// const SlippageWrapper = tw.div`
//   absolute top-40 right-0
// `;

const InnerWrapper = tw.div`
  flex flex-col gap-16
`;

// const IconWrapper = tw.div`
//   clickable w-32 h-32 items-center justify-center flex relative
// `;

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
