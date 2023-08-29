/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Meta, StoryObj } from '@storybook/react';
import tw from 'twin.macro';

import { ReactComponent as LogoText } from '~/assets/logos/logo-text.svg';

const meta = {
  title: 'Components/Logos',
  tags: ['autodocs'],
  argTypes: {
    color: { control: { type: 'color' } },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const _Logos: Story = {
  render: args => (
    <IconWrapper>
      <LogoText
        width={(args as any).width || 339}
        height={(args as any).height || 83}
        fill={(args as any).color}
      />
    </IconWrapper>
  ),
};

const IconWrapper = tw.div`
  grid grid-cols-6 gap-16
`;
