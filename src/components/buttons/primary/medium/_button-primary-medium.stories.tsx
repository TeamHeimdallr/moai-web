import type { Meta, StoryObj } from '@storybook/react';

import { ButtonPrimaryMedium } from '.';

const meta = {
  title: 'Components/Buttons/ButtonPrimaryMedium',
  component: ButtonPrimaryMedium,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof ButtonPrimaryMedium>;

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
