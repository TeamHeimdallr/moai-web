import type { Meta, StoryObj } from '@storybook/react';

import { InputTextField } from '.';

const meta = {
  title: 'Components/Inputs/TextField',
  component: InputTextField,
  tags: ['autodocs'],
  argTypes: {
    placeholder: { control: 'text' },
    error: { control: 'boolean' },
    errorMessage: { control: 'text' },
  },
} satisfies Meta<typeof InputTextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  args: {
    placeholder: 'Enter an address',
  },
};

export const HasValue: Story = {
  args: {
    placeholder: 'Enter an address',
    defaultValue: '0xd28FE83deE808A261C31732CE4Ce5db023FAaBCe',
  },
};

export const Error: Story = {
  args: {
    placeholder: 'Enter an address',
    defaultValue: '0xd28FE83deE808A261C31732CE4Ce5db023FAaBCe',
    error: true,
    errorMessage: 'This is an error message',
  },
};
