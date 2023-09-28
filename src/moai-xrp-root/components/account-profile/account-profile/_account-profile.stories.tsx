import type { Meta, StoryObj } from '@storybook/react';
import { WagmiConfig } from 'wagmi';

import { wagmiConfig } from '~/configs/setup-evm-wallet';

import { AccountProfile } from '.';

const meta = {
  title: 'Components/AccountProfile/AccountProfileRoot',
  component: AccountProfile,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof AccountProfile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  render: () => (
    <WagmiConfig config={wagmiConfig}>
      <AccountProfile />
    </WagmiConfig>
  ),
  args: {},
};