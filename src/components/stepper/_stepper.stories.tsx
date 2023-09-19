import type { Meta, StoryObj } from '@storybook/react';

import { Stepper } from '.';

const meta = {
  title: 'Components/Stepper/Stepper',
  component: Stepper,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  args: {
    totalSteps: 5,
    step: 3,
    isLoading: true,
  },
};
