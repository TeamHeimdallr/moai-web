import type { Meta, StoryObj } from '@storybook/react';
import { Web3Modal } from '@web3modal/react';
import { BrowserRouter } from 'react-router-dom';
import tw, { css, styled } from 'twin.macro';
import { WagmiConfig } from 'wagmi';

import { ethereumClient, projectId, wagmiConfig } from '~/configs/setup-wallet';
import { TOKEN } from '~/types/contracts';

import { AddLpInput } from '.';

const meta = {
  title: 'Pages/Detail/AddLiquidity/AddLpInput',
  component: AddLpInput,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof AddLpInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const _AddLpInput: Story = {
  render: args => (
    <>
      <WagmiConfig config={wagmiConfig}>
        <BrowserRouter>
          <Wrapper>
            <AddLpInput tokenList={args.tokenList} />
          </Wrapper>
        </BrowserRouter>
      </WagmiConfig>
      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </>
  ),
  args: {
    tokenList: [
      { name: TOKEN.MOAI, balance: 4.75 },
      { name: TOKEN.WETH, balance: 0.15 },
    ],
  },
};

const Wrapper = styled.div(() => [
  tw`relative w-full bg-neutral-5 h-800`,
  css`
    & > div {
      position: absolute !important;
    }
  `,
]);
