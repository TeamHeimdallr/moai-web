import type { Meta, StoryObj } from '@storybook/react';

import { Notification } from '.';

const meta = {
  title: 'Components/Notifications/Notification',
  component: Notification,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof Notification>;

export default meta;
type Story = StoryObj<typeof meta>;

export const _Notification: Story = {
  render: () => <Notification />,
  args: {},
};
