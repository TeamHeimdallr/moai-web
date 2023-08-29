/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Meta, StoryObj } from '@storybook/react';
import tw from 'twin.macro';

import * as Icons from '~/assets/icons';

const meta = {
  title: 'Components/Icons',
  tags: ['autodocs'],
  argTypes: {
    color: { control: { type: 'color' } },
    width: { control: { type: 'number' } },
    height: { control: { type: 'number' } },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const _Icons: Story = {
  render: args => (
    <IconWrapper>
      {Object.entries(Icons).map(([name, Icon]) => (
        <Icon
          key={name}
          title={name}
          width={(args as any).width || 24}
          height={(args as any).height || 24}
          fill={(args as any).color || '#000'}
        />
      ))}
    </IconWrapper>
  ),
};

const IconWrapper = tw.div`
  grid grid-cols-8 gap-20
`;
