import type { Meta, StoryObj } from '@storybook/react';

import Web3Provider from '~/hocs/hoc-web3-provider';

import MainPage from '.';

const meta = {
  title: 'Pages/Main',
  component: MainPage,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof MainPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const _MainPage: Story = {
  render: () => (
    <Web3Provider>
      <MainPage />
    </Web3Provider>
  ),
  args: {},
};
