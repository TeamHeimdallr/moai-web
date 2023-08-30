import type { Meta, StoryObj } from '@storybook/react';

import { IconFavorites } from '~/assets/icons';

import { ButtonIconSmall } from '.';

const meta = {
  title: 'Components/Buttons/ButtonIconSmall',
  component: ButtonIconSmall,
  tags: ['autodocs'],
  argTypes: {
    icon: { control: { disable: true } },
  },
} satisfies Meta<typeof ButtonIconSmall>;

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
