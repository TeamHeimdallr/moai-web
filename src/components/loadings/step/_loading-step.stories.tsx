import type { Meta, StoryObj } from '@storybook/react';

import { LoadingStep } from '.';

const meta = {
  title: 'Components/Loading/Step',
  component: LoadingStep,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof LoadingStep>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  args: {
    totalSteps: 5,
    step: 3,
    isLoading: true,
  },
};
