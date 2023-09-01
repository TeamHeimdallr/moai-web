import type { Meta, StoryObj } from '@storybook/react';
import tw from 'twin.macro';

import { TokenInfo } from '~/types/components';

import { MyPoolBalance } from '.';

const meta = {
  title: 'Components/Info/MyPoolBalanceInfo',
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const tokens: TokenInfo[] = [
  { name: 'MOAI', balance: 123.123, value: 104.87 },
  { name: 'WETH', balance: 2.73857, value: 37.1212 },
];

const totalBalance = 2001234;

export const _MyPoolBalance: Story = {
  render: () => (
    <Wrapper>
      <MyPoolBalance tokens={tokens} totalBalance={totalBalance} />
    </Wrapper>
  ),
};

const Wrapper = tw.div``;
