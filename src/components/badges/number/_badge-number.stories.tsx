import type { Meta, StoryObj } from '@storybook/react';

import { BadgeNumber } from '.';

const meta = {
  title: 'Components/Badges/BadgeNumber',
  component: BadgeNumber,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof BadgeNumber>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  args: {
    value: 1,
    selected: true,
  },
};

export const Unselected: Story = {
  args: {
    value: 1,
    selected: false,
  },
};
