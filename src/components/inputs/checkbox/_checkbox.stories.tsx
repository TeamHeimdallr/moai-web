import type { Meta, StoryObj } from '@storybook/react';

import { Checkbox } from '.';

const meta = {
  title: 'Components/Inputs/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const _Normal: Story = {
  args: {
    selected: false,
  },
};

export const _Selected: Story = {
  args: {
    selected: true,
  },
};
