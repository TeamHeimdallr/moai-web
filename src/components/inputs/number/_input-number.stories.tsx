import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { IconDown } from '~/assets/icons';

import { Token } from '~/components/token';

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
  render: () => <Template />,
};

const Template = () => {
  const [_inputValue, setInputValue] = useState<number>();

  return (
    <InputNumber
      handleChange={setInputValue}
      token={<Token token={'MOAI'} icon={<IconDown />} />}
      handleTokenClick={() => console.log('token clicked')}
      maxButton
      slider
      sliderActive
    />
  );
};

export const SelectableToken: Story = {
  args: {
    token: <Token token={'MOAI'} icon={<IconDown />} />,
    handleTokenClick: () => console.log('token clicked'),
  },
};

export const Slider: Story = {
  args: {
    token: <Token token={'MOAI'} icon={<IconDown />} />,
    handleTokenClick: () => console.log('token clicked'),
    slider: true,
  },
};

export const SliderActive: Story = {
  args: {
    token: <Token token={'MOAI'} icon={<IconDown />} />,
    handleTokenClick: () => console.log('token clicked'),
    slider: true,
    sliderActive: true,
  },
};
