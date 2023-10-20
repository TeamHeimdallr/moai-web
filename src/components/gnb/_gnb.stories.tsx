import { BrowserRouter } from 'react-router-dom';
import type { Meta, StoryObj } from '@storybook/react';
import tw, { css, styled } from 'twin.macro';

import Web3Provider from '~/hocs/hoc-web3-provider';

import { Gnb } from '.';

const meta = {
  title: 'Components/Gnb/GnbRoot',
  component: Gnb,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof Gnb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const _Gnb: Story = {
  render: () => (
    <>
      <Web3Provider>
        <BrowserRouter>
          <Wrapper>
            <Gnb />
          </Wrapper>
        </BrowserRouter>
      </Web3Provider>
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
