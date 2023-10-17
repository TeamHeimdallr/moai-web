import type { Meta, StoryObj } from '@storybook/react';

import { IconNext } from '~/assets/icons';

import { ButtonPrimaryLargeIconTrailing } from '.';

const meta = {
  title: 'Components/Buttons/ButtonPrimaryLargeIconTrailing',
  component: ButtonPrimaryLargeIconTrailing,
  tags: ['autodocs'],
  argTypes: {
    icon: { control: { disable: true } },
  },
} satisfies Meta<typeof ButtonPrimaryLargeIconTrailing>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  args: {
    text: 'Text here',
    icon: <IconNext />,
  },
};

export const Outlined: Story = {
  args: {
    text: 'Text here',
    icon: <IconNext />,
    buttonType: 'outlined',
  },
};

export const Loading: Story = {
  args: {
    text: 'Text here',
    icon: <IconNext />,
    isLoading: true,
  },
};

export const Disabled: Story = {
  args: {
    text: 'Text here',
    icon: <IconNext />,
    disabled: true,
  },
};
