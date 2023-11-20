import type { Meta } from '@storybook/react';
import tw from 'twin.macro';

import { ITokenComposition, NETWORK } from '~/types';

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
      id: 1,
      symbol: 'MOAI',
      network: NETWORK.THE_ROOT_NETWORK,

      address: '',
      currency: 'MOAI',

      weight: 50,
      value: 5129,
      balance: 7077,

      isCexListed: false,
      isLpToken: false,
    },
    {
      id: 2,
      symbol: 'WETH',
      network: NETWORK.THE_ROOT_NETWORK,

      address: '',
      currency: 'WETH',

      weight: 50,
      value: 5129,
      balance: 204,

      isCexListed: false,
      isLpToken: false,
    },
  ];
  return (
    <Wrapper>
      <GraphSemiDonut data={data} />
    </Wrapper>
  );
};

const Wrapper = tw.div`w-380 h-190`;
