/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Meta, StoryObj } from '@storybook/react';
import tw from 'twin.macro';

import {
  BgHeader,
  TokenDAI,
  TokenMNT,
  TokenMOAI,
  TokenUSDC,
  TokenUSDT,
  TokenWETH,
} from '~/assets/images';

const meta = {
  title: 'Components/Assets/Images',
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const _Images: Story = {
  render: () => (
    <Wrapper>
      <ImageBg title="bg-header" src={BgHeader} />
      <ImageWrapper>
        <Image title="token DAI" src={TokenDAI} />
        <Image title="token mnt" src={TokenMNT} />
        <Image title="token moai" src={TokenMOAI} />
        <Image title="token usdc" src={TokenUSDC} />
        <Image title="token usdt" src={TokenUSDT} />
        <Image title="token weth" src={TokenWETH} />
      </ImageWrapper>
    </Wrapper>
  ),
};

const Wrapper = tw.div`
  flex flex-col gap-20
`;
const ImageWrapper = tw.div`
  grid grid-cols-6 gap-20
`;

const Image = tw.img`
  w-60 h-60 object-cover
`;

const ImageBg = tw.img`
  w-full h-300 object-cover
`;
