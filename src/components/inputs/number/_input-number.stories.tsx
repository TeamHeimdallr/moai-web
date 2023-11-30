import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import type { Meta, StoryObj } from '@storybook/react';
import * as yup from 'yup';

import { IconDown } from '~/assets/icons';

import { Token } from '~/components/token';

import { InputNumber } from '.';

const meta = {
  title: 'Components/Inputs/Number',
  component: InputNumber,
  tags: ['autodocs'],
  argTypes: {
    // token: { control: { disable: true } },
  },
} satisfies Meta<typeof InputNumber>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  render: () => <Template />,
};

interface InputFormState {
  input1: number;
}

const Template = () => {
  const [_inputValue, setInputValue] = useState<number>();

  const schema = yup.object().shape({
    input1: yup.number().required(),
  });
  const { control } = useForm<InputFormState>({
    resolver: yupResolver(schema),
  });

  return (
    <InputNumber
      control={control}
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
