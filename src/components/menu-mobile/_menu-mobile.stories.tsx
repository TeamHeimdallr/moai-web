import { BrowserRouter } from 'react-router-dom';
import type { Meta, StoryObj } from '@storybook/react';
import tw, { css, styled } from 'twin.macro';

import Web3Provider from '~/hocs/hoc-web3-provider';

import { MobileMenu } from '.';

const meta = {
  title: 'Components/MobileMenu',
  component: MobileMenu,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof MobileMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const _MobileMenu: Story = {
  render: () => (
    <>
      <Web3Provider>
        <BrowserRouter>
          <Wrapper>
            <MobileMenu />
          </Wrapper>
        </BrowserRouter>
      </Web3Provider>
    </>
  ),
  args: {},
};

const Wrapper = tw.div``;
