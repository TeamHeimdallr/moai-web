import type { Meta, StoryObj } from '@storybook/react';

import { Radio } from '.';

const meta = {
  title: 'Components/Inputs/Radio',
  component: Radio,
  tags: ['autodocs'],
} satisfies Meta<typeof Radio>;

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
