import type { Meta, StoryObj } from '@storybook/react';

import { ButtonPrimarySmall } from '.';

const meta = {
  title: 'Components/Button/ButtonPrimarySmall',
  component: ButtonPrimarySmall,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof ButtonPrimarySmall>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  args: {
    text: 'Text here',
  },
};

export const Loading: Story = {
  args: {
    text: 'Text here',
    isLoading: true,
  },
};

export const Disabled: Story = {
  args: {
    text: 'Text here',
    disabled: true,
  },
};
