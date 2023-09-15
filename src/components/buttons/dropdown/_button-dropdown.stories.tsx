import type { Meta, StoryObj } from '@storybook/react';

import { ChainXRPL } from '~/assets/images';

import { ButtonDropdown } from '.';

const meta = {
  title: 'Components/Buttons/ButtonDropdown',
  component: ButtonDropdown,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof ButtonDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const _Normal: Story = {
  args: {
    text: 'XRPL',
    image: ChainXRPL,
    selected: false,
  },
};

export const _Selected: Story = {
  args: {
    text: 'XRPL',
    image: ChainXRPL,
    selected: true,
  },
};

export const _Opened: Story = {
  args: {
    text: 'XRPL',
    image: ChainXRPL,
    opened: true,
  },
};

export const _OpenedSelected: Story = {
  args: {
    text: 'XRPL',
    image: ChainXRPL,
    opened: true,
    selected: true,
  },
};
