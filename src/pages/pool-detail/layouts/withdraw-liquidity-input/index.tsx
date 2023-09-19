import { useRef, useState } from 'react';
import tw from 'twin.macro';
import * as yup from 'yup';

import { IconSetting } from '~/assets/icons';
import { Slippage } from '~/components/account-profile';
import { ButtonPrimaryLarge } from '~/components/buttons/primary';
import { InputNumber } from '~/components/inputs/number';
import { Tab } from '~/components/tab';
import { Token } from '~/components/token';
import { TOKEN_USD_MAPPER } from '~/constants';
import { useOnClickOutside } from '~/hooks/pages/use-onclick-outside';
import { usePopup } from '~/hooks/pages/use-popup';
import { useWithdrawLiquidityInputTabStore } from '~/states/components/withdraw-liquidity-input-tab';
import { Composition, HOOK_FORM_KEY, PoolInfo, POPUP_ID } from '~/types/components';
import { TOKEN } from '~/types/contracts';
import { formatNumber } from '~/utils/number';

import { AddLiquidityPopup } from '../../components/popup/popup-add-liquidity';

interface Props {
  poolInfo: PoolInfo;
  compositions: Composition[];
  tokenTotalSupply: number;
  liquidityPoolTokenBalance: number;
}
export const WithdrawLiquidityInput = ({
  poolInfo,
  compositions,
  tokenTotalSupply,
  liquidityPoolTokenBalance,
}: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  const [withdrawAmount, setWithdrawAmount] = useState<number>();

  const tabs = [
    { key: 'proportional', name: 'Proportional pool tokens' },
    { key: 'single', name: 'Single token', disabled: true },
  ];
  const { selected: selectedTab, select: selectTab } = useWithdrawLiquidityInputTabStore();
  const { opened: popupOpened, open: popupOpen } = usePopup(POPUP_ID.WITHDRAW_LP);

  const priceImpact = 0.13; // TODO

  const [settingOpened, settingOpen] = useState(false);
  const toggle = () => settingOpen(prev => !prev);

  useOnClickOutside([ref, iconRef], () => settingOpen(false));

  const handleMax = () => {
    // TODO
  };
  const schema = yup.object({
    [HOOK_FORM_KEY.NUMBER_INPUT_VALUE]: yup
      .number()
      .min(0)
      .max(liquidityPoolTokenBalance || 0, 'Exceeds token balance'),
  });
  const tokenUSD =
    (withdrawAmount ?? 0) * (tokenTotalSupply ? poolInfo.valueRaw / tokenTotalSupply : 0);

  return (
    <Wrapper>
      <Header>
        <Tab tabs={tabs} selectedTab={selectedTab} onClick={selectTab} />
        <IconWrapper onClick={toggle} ref={iconRef}>
          <IconSetting fill={settingOpened ? '#F5FF83' : '#9296AD'} width={20} height={20} />
        </IconWrapper>
        {settingOpened && (
          <SlippageWrapper ref={ref}>
            <Slippage shadow />
          </SlippageWrapper>
        )}
      </Header>
      <InnerWrapper>
        <InputNumber
          schema={schema}
          token={<Token token={poolInfo.name} />}
          tokenName={poolInfo.name}
          tokenUSD={tokenUSD}
          balance={liquidityPoolTokenBalance}
          value={withdrawAmount}
          handleChange={val => setWithdrawAmount(val)}
          slider
          sliderActive
        />
      </InnerWrapper>
      <ButtonPrimaryLarge text="Preview" onClick={popupOpen} />
      {/* {popupOpened && ()} */}
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col bg-neutral-10 gap-24 px-24 py-20 rounded-12 w-452
`;

const Header = tw.div`
  flex justify-between items-center gap-10 w-full relative
`;

const SlippageWrapper = tw.div`
  absolute top-40 right-0
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

const MaxButton = tw.div`
  bg-neutral-10 gap-6 px-12 py-5 rounded-8 text-primary-60 font-m-12 clickable
`;

const PriceImpact = tw.div`
  text-neutral-100 font-r-14 whitespace-pre-wrap
`;
