import type { Meta, StoryObj } from '@storybook/react';
import tw from 'twin.macro';

import { POOL_ID, TOKEN_ADDRESS, TOKEN_USD_MAPPER } from '~/constants';
import { TOKEN } from '~/types/contracts';

import { PoolBalance } from '.';

const meta = {
  title: 'Components/Info/PoolBalance',
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const pool = {
  id: POOL_ID.POOL_A,
  tokenAddress: TOKEN_ADDRESS.POOL_A,
  compositions: [
    { name: TOKEN.MOAI, weight: 80, balance: 7077.75, price: TOKEN_USD_MAPPER[TOKEN.MOAI] },
    { name: TOKEN.WETH, weight: 20, balance: 147, price: TOKEN_USD_MAPPER[TOKEN.WETH] },
  ],
  value: '$1,259,280',
  volume: '$78,086',
  apr: '6.79%',
  fees: '$234.25',
  name: '80MOAI-20WETH',
};

export const _MyPoolBalance: Story = {
  render: () => (
    <Wrapper>
      <PoolBalance compositions={pool.compositions} pool={pool} />
    </Wrapper>
  ),
};

const Wrapper = tw.div``;
