import type { Meta } from '@storybook/react';
import tw from 'twin.macro';

import Graph from '.';

const meta = {
  title: 'Components/Graph/SemiDoughnut',
  component: Graph,
  tags: ['autodocs'],
} satisfies Meta<typeof Graph>;

export default meta;

const Wrapper = tw.div`w-500 h-200`;

export const DonoutGraph = () => {
  return (
    <Wrapper>
      <Graph />
    </Wrapper>
  );
};
