import type { Meta, StoryObj } from '@storybook/react';

import { Toggle } from '.';

const meta = {
  title: 'Components/Toggle/Toggle',
  component: Toggle,
  tags: ['autodocs'],
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const _Toggle: Story = {
  args: {
    selected: false,
  },
};
