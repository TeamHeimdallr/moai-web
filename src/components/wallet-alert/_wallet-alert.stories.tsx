import type { Meta, StoryObj } from '@storybook/react';

import { WalletAlert } from '.';

const meta = {
  title: 'Components/WalletAlert',
  component: WalletAlert,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof WalletAlert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  args: {},
};
