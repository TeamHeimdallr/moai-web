import type { Meta, StoryObj } from '@storybook/react';

import { IconNext } from '~/assets/icons';

import { ButtonPrimaryMediumIconTrailing } from '.';

const meta = {
  title: 'Components/Buttons/ButtonPrimaryMediumIconTrailing',
  component: ButtonPrimaryMediumIconTrailing,
  tags: ['autodocs'],
  argTypes: {
    icon: { control: { disable: true } },
  },
} satisfies Meta<typeof ButtonPrimaryMediumIconTrailing>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  args: {
    text: 'Text here',
    icon: <IconNext />,
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
