import type { Meta, StoryObj } from '@storybook/react';

import { TOKEN } from '~/constants';

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
    token: TOKEN.ROOT,
  },
};
