import type { Meta, StoryObj } from '@storybook/react';

import { TokenMNT } from '~/assets/images';

import { Token } from '.';

const meta = {
  title: 'Components/Token/Token',
  component: Token,
  tags: ['autodocs'],
  argTypes: {
    icon: { control: { disable: true } },
  },
} satisfies Meta<typeof Token>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  args: {
    token: 'MNT',
    icon: TokenMNT,
  },
};

export const NoIcon: Story = {
  args: {
    token: 'MNT',
  },
};

export const Small: Story = {
  args: {
    token: 'MNT',
    type: 'small',
    icon: TokenMNT,
  },
};

export const Large: Story = {
  args: {
    token: 'MNT',
    type: 'large',
    icon: TokenMNT,
  },
};

export const WithRaio: Story = {
  args: {
    token: 'MNT',
    percentage: 80,
    icon: TokenMNT,
  },
};

export const Selected: Story = {
  args: {
    token: 'MNT',
    percentage: 80,
    icon: TokenMNT,
    selected: true,
  },
};

export const NonClickable: Story = {
  args: {
    token: 'MNT',
    percentage: 80,
    icon: TokenMNT,
    clickable: false,
  },
};
