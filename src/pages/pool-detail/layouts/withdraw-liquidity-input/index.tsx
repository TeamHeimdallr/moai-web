import { useRef, useState } from 'react';
import tw from 'twin.macro';
import * as yup from 'yup';

import { IconSetting } from '~/assets/icons';
import { Slippage } from '~/components/account-profile';
import { ButtonPrimaryLarge } from '~/components/buttons/primary';
import { InputNumber } from '~/components/inputs/number';
import { Tab } from '~/components/tab';
import { Token } from '~/components/token';
import { TokenList } from '~/components/token-list';
import { TOKEN_DESCRIPTION_MAPPER, TOKEN_IMAGE_MAPPER } from '~/constants';
import { useOnClickOutside } from '~/hooks/pages/use-onclick-outside';
import { usePopup } from '~/hooks/pages/use-popup';
import { useWithdrawLiquidityInputTabStore } from '~/states/components/withdraw-liquidity-input-tab';
import { Composition, HOOK_FORM_KEY, PoolInfo, POPUP_ID } from '~/types/components';
import { formatNumber } from '~/utils/number';

import { WithdrawLiquidityPopup } from '../../components/popup/popup-withdraw-liquidity';

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
        <ContentWrapper>
          <SubTitle>You provide</SubTitle>
          <InputNumber
            schema={schema}
            token={<Token token={poolInfo.name} />}
            tokenName={poolInfo.name}
            tokenUSD={tokenUSD}
            balance={liquidityPoolTokenBalance}
            value={withdrawAmount}
            handleChange={val => setWithdrawAmount(val)}
            maxButton
            slider
            sliderActive
          />
        </ContentWrapper>
        <ContentWrapper>
          <SubTitle>You receive</SubTitle>
          <TokenListWrapper>
            {compositions.map(({ tokenAddress, name, weight }, i) => (
              <>
                <TokenList
                  key={tokenAddress}
                  type="large"
                  title={`${name} ${weight}%`}
                  description={`${TOKEN_DESCRIPTION_MAPPER[name]}`}
                  image={TOKEN_IMAGE_MAPPER[name]}
                  leftAlign={true}
                />
                {i !== compositions.length - 1 && <Divider />}
              </>
            ))}
          </TokenListWrapper>
        </ContentWrapper>
        <PriceImpaceWrapper>
          <PriceImpact>Price impact</PriceImpact>
          <PriceImpact>{`< ${formatNumber(priceImpact)}%`}</PriceImpact>
        </PriceImpaceWrapper>
      </InnerWrapper>
      <ButtonPrimaryLarge text="Preview" onClick={popupOpen} />
      {popupOpened && (
        <WithdrawLiquidityPopup
          poolInfo={poolInfo}
          compositions={compositions}
          withdrawAmount={withdrawAmount ?? 0}
          liquidityPoolTokenBalance={liquidityPoolTokenBalance}
          tokenUSD={tokenUSD}
          priceImpact={priceImpact}
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

const SlippageWrapper = tw.div`
  absolute top-40 right-0
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
