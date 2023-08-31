import type { Meta, StoryObj } from '@storybook/react';
import tw from 'twin.macro';

import { TOKEN_IMAGE_MAPPER } from '~/constants';

import { MyBalanceInfo } from '.';

const meta = {
  title: 'Components/Info/MyBalanceInfo',
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const tokens = [
  { title: 'MOAI', balance: 123123, price: 167904.87, image: TOKEN_IMAGE_MAPPER['MOAI'] },
  { title: 'WETH', balance: 2.73857, price: 3.1212, image: TOKEN_IMAGE_MAPPER['WETH'] },
  { title: 'USDC', balance: 0, price: 0, image: TOKEN_IMAGE_MAPPER['USDC'] },
  { title: 'USDT', balance: 0, price: 0, image: TOKEN_IMAGE_MAPPER['USDT'] },
];

export const _MyBalanceInfo: Story = {
  render: () => (
    <Wrapper>
      <MyBalanceInfo tokens={tokens} />
    </Wrapper>
  ),
};

const Wrapper = tw.div``;
