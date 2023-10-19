import type { Meta } from '@storybook/react';
import tw from 'twin.macro';

import { ITokenComposition } from '~/types';

import { GraphSemiDonut } from '.';

const meta = {
  title: 'Components/Graph/GraphSemiDonut',
  component: GraphSemiDonut,
  tags: ['autodocs'],
} satisfies Meta<typeof GraphSemiDonut>;

export default meta;

export const DonoutGraph = () => {
  const data: ITokenComposition[] = [
    {
      symbol: 'MOAI',
      weight: 50,
      value: 5129,
      balance: 7077,
    },
    {
      symbol: 'WETH',
      weight: 50,
      value: 5129,
      balance: 204,
    },
  ];
  return (
    <Wrapper>
      <GraphSemiDonut data={data} />
    </Wrapper>
  );
};

const Wrapper = tw.div`w-380 h-190`;
