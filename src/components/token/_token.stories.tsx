import type { Meta, StoryObj } from '@storybook/react';

import { IconDown } from '~/assets/icons';
import { TokenMNT } from '~/assets/images';

import { Token } from '.';

const meta = {
  title: 'Components/Token/Token',
  component: Token,
  tags: ['autodocs'],
  argTypes: {
    tokenImage: { control: { disable: true } },
    icon: { control: { disable: true } },
  },
} satisfies Meta<typeof Token>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  args: {
    token: 'MNT',
    tokenImage: TokenMNT,
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
    tokenImage: TokenMNT,
  },
};

export const Large: Story = {
  args: {
    token: 'MNT',
    type: 'large',
    tokenImage: TokenMNT,
  },
};

export const WithRaio: Story = {
  args: {
    token: 'MNT',
    percentage: 80,
    tokenImage: TokenMNT,
  },
};

export const Selected: Story = {
  args: {
    token: 'MNT',
    percentage: 80,
    tokenImage: TokenMNT,
    selected: true,
  },
};

export const NonClickable: Story = {
  args: {
    token: 'MNT',
    percentage: 80,
    tokenImage: TokenMNT,
    clickable: false,
  },
};

export const WithIcon: Story = {
  args: {
    token: 'MNT',
    tokenImage: TokenMNT,
    icon: <IconDown />,
  },
};
