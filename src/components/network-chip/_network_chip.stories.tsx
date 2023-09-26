import type { Meta, StoryObj } from '@storybook/react';

import { NetworkChip } from '.';

const meta = {
  title: 'Components/NetworkChip/NetworkChip',
  component: NetworkChip,
  tags: ['autodocs'],
  argTypes: {
    network: { control: { disable: true } },
  },
} satisfies Meta<typeof NetworkChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Xrpl: Story = {
  args: {
    network: 'XRPL',
  },
};

export const Root: Story = {
  args: {
    network: 'ROOT',
  },
};

export const EVM: Story = {
  args: {
    network: 'EVM',
  },
};
