import type { Meta, StoryObj } from '@storybook/react';

import { Checkbox } from '.';

const meta = {
  title: 'Components/Checkbox/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const _Checkbox: Story = {
  args: {
    selected: false,
  },
};
