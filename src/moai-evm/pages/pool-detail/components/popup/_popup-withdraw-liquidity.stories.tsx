import type { Meta } from '@storybook/react';
import tw from 'twin.macro';

import { ButtonPrimarySmall } from '~/components/buttons/primary';
import { Popup } from '~/components/popup';

import { usePopup } from '~/hooks/pages/use-popup';
import { POPUP_ID } from '~/types';

import { WithdrawLiquidityPopup } from './popup-withdraw-liquidity';

const meta = {
  title: 'Pages/Detail/AddLiquidity/AddLiquidityPopup',
  component: Popup,
  tags: ['autodocs'],
} satisfies Meta<typeof Popup>;

export default meta;

export const _AddLiquidityPopup = () => {
  const { opened, open } = usePopup(POPUP_ID.ADD_LP);

  return (
    <Wrapper>
      <ButtonPrimarySmall text="open preview popup !" onClick={open} />
      {opened && (
        <WithdrawLiquidityPopup
          poolInfo={{
            id: '0x0',

            // lp token
            tokenName: 'MOAI-WETH LP',
            tokenAddress: '0x0',
            tokenTotalSupply: 1000000000000000,

            compositions: [
              { name: 'MOAI', balance: 0, price: 0, value: 0, tokenAddress: '0x0', weight: 50 },
              { name: 'WETH', balance: 0, price: 0, value: 0, tokenAddress: '0x0', weight: 50 },
            ],

            formattedBalance: '$10',
            formattedValue: '$10',
            formattedVolume: '$10',
            formattedApr: '10%',
            formattedFees: '0.003%',

            balance: 10,
            value: 10,
            volume: 10,
            apr: 10,
            fees: 0.003,
          }}
          withdrawInputValue={100}
          liquidityPoolTokenBalance={100000000}
          tokenValue={810.45}
          priceImpact={0.13}
        />
      )}
    </Wrapper>
  );
};

const Wrapper = tw.div``;
