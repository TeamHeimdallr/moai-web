import type { Meta, StoryObj } from '@storybook/react';

import { IconDown } from '~/assets/icons';
import { Token } from '~/components/token';
import { TOKEN } from '~/constants/constant-token';

import { InputNumber } from '.';

const meta = {
  title: 'Components/Inputs/Number',
  component: InputNumber,
  tags: ['autodocs'],
  argTypes: {
    token: { control: { disable: true } },
  },
} satisfies Meta<typeof InputNumber>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  args: {
    token: <Token token={TOKEN.MNT} percentage={80} clickable={false} />,
  },
};

export const SelectableToken: Story = {
  args: {
    token: <Token token={TOKEN.MNT} icon={<IconDown />} />,
    handleTokenClick: () => console.log('token clicked'),
  },
};
