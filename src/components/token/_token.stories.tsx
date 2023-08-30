import type { Meta, StoryObj } from '@storybook/react';

import { IconDown } from '~/assets/icons';
import { TOKEN } from '~/constants/constant-token';

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
    token: TOKEN.MNT,
  },
};

export const NoImage: Story = {
  args: {
    token: TOKEN.MNT,
    image: false,
  },
};

export const Small: Story = {
  args: {
    token: TOKEN.MNT,
    type: 'small',
  },
};

export const Large: Story = {
  args: {
    token: TOKEN.MNT,
    type: 'large',
  },
};

export const WithRaio: Story = {
  args: {
    token: TOKEN.MNT,
    percentage: 80,
  },
};

export const Selected: Story = {
  args: {
    token: TOKEN.MNT,
    percentage: 80,
    selected: true,
  },
};

export const NonClickable: Story = {
  args: {
    token: TOKEN.MNT,
    percentage: 80,
    clickable: false,
  },
};

export const WithIcon: Story = {
  args: {
    token: TOKEN.MNT,
    icon: <IconDown />,
  },
};
