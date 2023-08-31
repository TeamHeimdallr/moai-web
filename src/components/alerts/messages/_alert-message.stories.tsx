import type { Meta, StoryObj } from '@storybook/react';

import { AlertMessage } from '.';

const meta = {
  title: 'Components/Alerts/AlertMessage',
  component: AlertMessage,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof AlertMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Error: Story = {
  args: {
    type: 'error',
    title: 'The total weight must be 100%',
    description:
      'The total weighting of all tokens must equal exactly 100% before you can proceed.',
  },
};

export const Warning: Story = {
  args: {
    type: 'warning',
    title: "It's recommended to provide new pools with at least $20,000 in initial funds",
    description:
      'Based on your wallet balances for these tokens, the maximum amount you can fund this pool with is ~$0.00.',
  },
};
