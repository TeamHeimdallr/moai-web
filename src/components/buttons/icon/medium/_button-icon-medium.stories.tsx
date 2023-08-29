import type { Meta, StoryObj } from '@storybook/react';

import { IconFavorites } from '~/assets/icons';

import { ButtonIconMedium } from '.';

const meta = {
  title: 'Components/Button/ButtonIconMedium',
  component: ButtonIconMedium,
  tags: ['autodocs'],
  argTypes: {
    icon: { control: { disable: true } },
  },
} satisfies Meta<typeof ButtonIconMedium>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  args: {
    icon: <IconFavorites />,
  },
};

export const Selected: Story = {
  args: {
    icon: <IconFavorites />,
    selected: true,
  },
};

export const Disabled: Story = {
  args: {
    icon: <IconFavorites />,
    disabled: true,
  },
};
