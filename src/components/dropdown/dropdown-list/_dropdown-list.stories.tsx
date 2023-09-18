import type { Meta, StoryObj } from '@storybook/react';

import { TokenROOT } from '~/assets/images';

import { DropdownList } from '.';

const meta = {
  title: 'Components/Dropdown/DropdownList',
  component: DropdownList,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof DropdownList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  args: {
    id: 1,

    image: TokenROOT,
    imageAlt: 'Root',
    imageTitle: 'Root',

    text: 'Token',
  },
};

export const Selected: Story = {
  args: {
    id: 1,

    image: TokenROOT,
    imageAlt: 'Root',
    imageTitle: 'Root',

    selected: true,
    handleSelect: id => console.log(id),

    text: 'Token',
  },
};

export const Disabled: Story = {
  args: {
    id: 1,

    image: TokenROOT,
    imageAlt: 'Root',
    imageTitle: 'Root',

    disabled: true,
    selected: true,
    handleSelect: id => console.log(id),

    text: 'Token',
  },
};
