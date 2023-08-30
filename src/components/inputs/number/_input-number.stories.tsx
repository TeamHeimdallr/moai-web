import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import * as yup from 'yup';

import { IconDown } from '~/assets/icons';
import { Token } from '~/components/token';
import { TOKEN } from '~/constants/constant-token';
import { HOOK_FORM_KEY } from '~/types/components/inputs';

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

  const balance = 1234.12;
  const schema = yup.object({
    [HOOK_FORM_KEY.NUMBER_INPUT_VALUE]: yup
      .number()
      .min(0)
      .max(balance || 0, 'Exceeds wallet balance'),
  });

  return (
    <InputNumber
      schema={schema}
      handleChange={setInputValue}
      token={<Token token={TOKEN.MNT} icon={<IconDown />} />}
      handleTokenClick={() => console.log('token clicked')}
      maxButton
      slider
      sliderActive
    />
  );
};

export const SelectableToken: Story = {
  args: {
    token: <Token token={TOKEN.MNT} icon={<IconDown />} />,
    handleTokenClick: () => console.log('token clicked'),
  },
};

export const Slider: Story = {
  args: {
    token: <Token token={TOKEN.MNT} icon={<IconDown />} />,
    handleTokenClick: () => console.log('token clicked'),
    slider: true,
  },
};

export const SliderActive: Story = {
  args: {
    token: <Token token={TOKEN.MNT} icon={<IconDown />} />,
    handleTokenClick: () => console.log('token clicked'),
    slider: true,
    sliderActive: true,
  },
};
