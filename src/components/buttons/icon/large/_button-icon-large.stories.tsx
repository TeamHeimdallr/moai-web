import type { Meta, StoryObj } from '@storybook/react';

import { IconFavorites } from '~/assets/icons';

import { ButtonIconLarge } from '.';

const meta = {
  title: 'Components/Buttons/ButtonIconLarge',
  component: ButtonIconLarge,
  tags: ['autodocs'],
  argTypes: {
    icon: { control: { disable: true } },
  },
} satisfies Meta<typeof ButtonIconLarge>;

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
