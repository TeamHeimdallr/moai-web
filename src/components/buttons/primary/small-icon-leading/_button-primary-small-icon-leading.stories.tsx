import type { Meta, StoryObj } from '@storybook/react';

import { IconBack } from '~/assets/icons';

import { ButtonPrimarySmallIconLeading } from '.';

const meta = {
  title: 'Components/Buttons/ButtonPrimarySmallIconLeading',
  component: ButtonPrimarySmallIconLeading,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof ButtonPrimarySmallIconLeading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  args: {
    text: 'Text here',
    icon: <IconBack />,
  },
};

export const Loading: Story = {
  args: {
    text: 'Text here',
    isLoading: true,
    icon: <IconBack />,
  },
};

export const Disabled: Story = {
  args: {
    text: 'Text here',
    disabled: true,
    icon: <IconBack />,
  },
};
