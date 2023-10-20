import type { Meta, StoryObj } from '@storybook/react';

import { ButtonChipFilter } from '.';

const meta = {
  title: 'Components/Buttons/ButtonChipFilter',
  component: ButtonChipFilter,
  tags: ['autodocs'],
} satisfies Meta<typeof ButtonChipFilter>;

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
