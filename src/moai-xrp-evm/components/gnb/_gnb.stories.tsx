import { BrowserRouter } from 'react-router-dom';
import type { Meta, StoryObj } from '@storybook/react';
import { Web3Modal } from '@web3modal/react';
import tw, { css, styled } from 'twin.macro';
import { WagmiConfig } from 'wagmi';

import { ethereumClient, projectId, wagmiConfig } from '~/configs/setup-evm-client';

import { Gnb } from '.';

const meta = {
  title: 'Components/Gnb/Gnb',
  component: Gnb,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof Gnb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const _Gnb: Story = {
  render: () => (
    <>
      <WagmiConfig config={wagmiConfig}>
        <BrowserRouter>
          <Wrapper>
            <Gnb />
          </Wrapper>
        </BrowserRouter>
      </WagmiConfig>
      <Web3Modal
        projectId={projectId}
        ethereumClient={ethereumClient}
        themeVariables={{
          '--w3m-accent-color': '#23263A',
          '--w3m-font-family': 'Pretendard Variable',
          '--w3m-text-medium-regular-size': '14px',
          '--w3m-text-medium-regular-weight': '500',
          '--w3m-text-medium-regular-line-height': '22px',
        }}
      />
    </>
  ),
  args: {},
};

const Wrapper = styled.div(() => [
  tw`relative w-full bg-neutral-5 h-800`,
  css`
    & > div {
      position: absolute !important;
    }
  `,
]);
