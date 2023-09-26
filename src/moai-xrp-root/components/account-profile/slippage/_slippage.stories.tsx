import type { Meta, StoryObj } from '@storybook/react';

import { Slippage } from '.';

const meta = {
  title: 'Components/AccountProfile/SlippageRoot',
  component: Slippage,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof Slippage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  args: {},
};
