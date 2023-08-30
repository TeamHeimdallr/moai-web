import type { Meta, StoryObj } from '@storybook/react';

import { IconSearch } from '~/assets/icons';

import { ButtonPrimaryMediumIconLeading } from '.';

const meta = {
  title: 'Components/Buttons/ButtonPrimaryMediumIconLeading',
  component: ButtonPrimaryMediumIconLeading,
  tags: ['autodocs'],
  argTypes: {
    icon: { control: { disable: true } },
  },
} satisfies Meta<typeof ButtonPrimaryMediumIconLeading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  args: {
    text: 'Text here',
    icon: <IconSearch />,
  },
};

export const Loading: Story = {
  args: {
    text: 'Text here',
    icon: <IconSearch />,
    isLoading: true,
  },
};

export const Disabled: Story = {
  args: {
    text: 'Text here',
    icon: <IconSearch />,
    disabled: true,
  },
};
