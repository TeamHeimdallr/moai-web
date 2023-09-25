import type { Meta, StoryObj } from '@storybook/react';
import tw from 'twin.macro';

import { TokenInfo } from '~/moai-evm/types/components';

import { BalanceInfo } from '.';

const meta = {
  title: 'Components/Info/BalanceInfo',
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const tokens: TokenInfo[] = [
  { name: 'MOAI', balance: 123123, price: 123, value: 167904.87 },
  { name: 'WETH', balance: 2.73857, price: 123, value: 3.1212 },
  { name: 'USDC', balance: 0, price: 123, value: 0 },
  { name: 'USDT', balance: 0, price: 123, value: 0 },
];

export const _MyBalanceInfo: Story = {
  render: () => (
    <Wrapper>
      <BalanceInfo tokens={tokens} />
    </Wrapper>
  ),
};

const Wrapper = tw.div``;
