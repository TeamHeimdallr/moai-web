import type { Meta, StoryObj } from '@storybook/react';

import { SwitchNetwork } from '.';

const meta = {
  title: 'Components/Banner/SwitchNetworkRoot',
  component: SwitchNetwork,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof SwitchNetwork>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  args: {},
};
