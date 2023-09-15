import type { Meta, StoryObj } from '@storybook/react';

import { NetworkSelection } from '.';

const meta = {
  title: 'Components/NetworkSelection/NetworkSelection',
  component: NetworkSelection,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof NetworkSelection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const _Normal: Story = {
  render: () => <NetworkSelection />,
  args: {},
};
