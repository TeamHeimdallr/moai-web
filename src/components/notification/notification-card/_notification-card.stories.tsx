import type { Meta, StoryObj } from '@storybook/react';

import { SCANNER_URL } from '~/constants';

import { NotificationCard } from '.';

const meta = {
  title: 'Components/Notifications/NotificationCard',
  component: NotificationCard,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof NotificationCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const _Normal: Story = {
  render: args => <NotificationCard {...args} />,
  args: {
    title: 'Add liquidity',
    description: '$0.10 in 20% MOAI, 80% USDC',
    link: SCANNER_URL,
  },
};
