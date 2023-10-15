import type { Meta, StoryObj } from '@storybook/react';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { goerli } from 'wagmi/dist/chains';
import { MetaMaskConnector } from 'wagmi/dist/connectors/metaMask';
import { publicProvider } from 'wagmi/dist/providers/public';

import { Account } from '.';

const meta = {
  title: 'Components/Account/Account',
  component: Account,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof Account>;

export default meta;
type Story = StoryObj<typeof meta>;

const { publicClient } = configureChains([goerli], [publicProvider()]);
const config = createConfig({
  connectors: [new MetaMaskConnector()],
  publicClient,
});

export const Normal: Story = {
  render: () => (
    <WagmiConfig config={config}>
      <Account />
    </WagmiConfig>
  ),
  args: {},
};
