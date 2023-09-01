import type { Meta, StoryObj } from '@storybook/react';
import tw from 'twin.macro';

import { TOKEN_IMAGE_MAPPER } from '~/constants';

import { TokenList } from '../token-list';
import { List } from '.';

const meta = {
  title: 'Components/Lists/List',
  component: List,
  tags: ['autodocs'],
  argTypes: {
    children: { control: { disable: true } },
  },
} satisfies Meta<typeof List>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  render: ({ title }) => (
    <List title={title}>
      <TokenList
        type="large"
        title={'MOAI'}
        description={'description'}
        image={TOKEN_IMAGE_MAPPER['MOAI']}
      />
      <Divider />
      <TokenList
        type="large"
        title={'MOAI'}
        description={'description'}
        image={TOKEN_IMAGE_MAPPER['MOAI']}
      />
    </List>
  ),
  args: { title: 'title' },
};

export const NoHeader: Story = {
  render: () => (
    <List>
      <TokenList
        type="large"
        title={'MOAI'}
        description={'description'}
        image={TOKEN_IMAGE_MAPPER['MOAI']}
      />
      <Divider />
      <TokenList
        type="large"
        title={'MOAI'}
        description={'description'}
        image={TOKEN_IMAGE_MAPPER['MOAI']}
      />
    </List>
  ),
  args: {},
};

const Divider = tw.div`
  w-full h-1 bg-neutral-20 flex-shrink-0
`;
