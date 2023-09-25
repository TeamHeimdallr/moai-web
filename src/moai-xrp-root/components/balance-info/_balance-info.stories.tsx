import type { Meta, StoryObj } from '@storybook/react';
import tw from 'twin.macro';

import { TokenInfo } from '~/moai-xrp-root/types/components';

import { BalanceInfo } from '.';

const meta = {
  title: 'Components/Info/BalanceInfo',
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const tokens: TokenInfo[] = [
  { name: 'ROOT', balance: 123123, price: 123, value: 167904.87 },
  { name: 'XRP', balance: 2.73857, price: 123, value: 3.1212 },
];

export const _MyBalanceInfoRoot: Story = {
  render: () => (
    <Wrapper>
      <BalanceInfo tokens={tokens} />
    </Wrapper>
  ),
};

const Wrapper = tw.div``;
