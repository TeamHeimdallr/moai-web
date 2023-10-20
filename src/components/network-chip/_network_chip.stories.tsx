import type { Meta, StoryObj } from '@storybook/react';

import { NETWORK } from '~/types';

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
  args: { network: NETWORK.XRPL },
};

export const Root: Story = {
  args: { network: NETWORK.THE_ROOT_NETWORK },
};

export const EVM: Story = {
  args: { network: NETWORK.EVM_SIDECHAIN },
};
