import type { Meta } from '@storybook/react';
import tw from 'twin.macro';

import { ButtonPrimarySmall } from '~/components/buttons/primary';
import { Popup } from '~/components/popup';

import { usePopup } from '~/hooks/pages/use-popup';
import { POPUP_ID } from '~/types/components';

import { TOKEN } from '~/moai-xrp-root/types/contracts';

import { AddLiquidityPopup } from './popup-add-liquidity';

const meta = {
  title: 'Pages-xrp-root/Detail/AddLiquidity/AddLiquidityPopup',
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
        <AddLiquidityPopup
          poolInfo={{
            id: '0x0',

            // lp token
            tokenName: 'ROOT-XRP LP',
            tokenAddress: '0x0',
            tokenTotalSupply: 1000000000000000,

            compositions: [
              { name: 'ROOT', balance: 0, price: 0, value: 0, tokenAddress: '0x0', weight: 50 },
              { name: 'XRP', balance: 0, price: 0, value: 0, tokenAddress: '0x0', weight: 50 },
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
          tokenInputValues={
            [
              { name: TOKEN.ROOT, amount: 4.49 },
              { name: TOKEN.XRP, amount: 0.1 },
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ] as any
          }
          totalValue={810.45}
          priceImpact={0.13}
        />
      )}
    </Wrapper>
  );
};

const Wrapper = tw.div``;
