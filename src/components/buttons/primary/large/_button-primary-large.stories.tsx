import type { Meta, StoryObj } from '@storybook/react';

import { ButtonPrimaryLarge } from '.';

const meta = {
  title: 'Components/Buttons/ButtonPrimaryLarge',
  component: ButtonPrimaryLarge,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof ButtonPrimaryLarge>;

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

export const Outlined: Story = {
  args: {
    text: 'Text here',
    buttonType: 'outlined',
  },
};

export const OutlinedLoading: Story = {
  args: {
    text: 'Text here',
    buttonType: 'outlined',
    isLoading: true,
  },
};

export const OutlinedDisabled: Story = {
  args: {
    text: 'Text here',
    buttonType: 'outlined',
    disabled: true,
  },
};
