import type { Meta, StoryObj } from '@storybook/react';

import { FilterChip } from '.';

const meta = {
  title: 'Components/FilterChip/FilterChip',
  component: FilterChip,
  tags: ['autodocs'],
} satisfies Meta<typeof FilterChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  args: {
    selected: false,
    token: { symbol: 'ROOT' },
  },
};

export const Selected: Story = {
  args: {
    selected: true,
    token: { symbol: 'ROOT' },
  },
};
