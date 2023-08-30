import type { Meta, StoryObj } from '@storybook/react';

import { Radio } from '.';

const meta = {
  title: 'Components/Radio/Radio',
  component: Radio,
  tags: ['autodocs'],
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const _Radio: Story = {
  args: {
    selected: false,
  },
};
