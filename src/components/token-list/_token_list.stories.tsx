import type { Meta } from '@storybook/react';
import { useState } from 'react';
import tw from 'twin.macro';

import { COLOR } from '~/assets/colors';
import usdc from '~/assets/images/token-usdc.png';

import { TokenList } from '.';

const meta = {
  title: 'Components/TokenList/TokenList',
} satisfies Meta;

export default meta;

export const _Large = () => {
  const title = 'MOAI';
  const description = '$100';
  return (
    <Wrapper>
      <TokenList
        type="large"
        title={title}
        description={description}
        image={usdc}
        backgroundColor={COLOR.NEUTRAL[15]}
      />
    </Wrapper>
  );
};
export const _Medium = () => {
  const title = 'MOAI';
  const description = '$100';
  return (
    <Wrapper>
      <TokenList type="medium" title={title} description={description} image={usdc} />
    </Wrapper>
  );
};
export const _Clickable = () => {
  const title = 'MOAI';
  const description = 'MOAI Finance Token';
  const [selected, select] = useState(false);
  return (
    <Wrapper>
      <TokenList
        type="selectable"
        title={title}
        description={description}
        image={usdc}
        selected={selected}
        onClick={() => select(prev => !prev)}
        balance="1,234"
        price="$8.00"
      />
      <TokenList
        type="selectable"
        title={title}
        description={description}
        image={usdc}
        balance="1,234"
        price="$8.00"
      />
      <TokenList
        type="selectable"
        title={title}
        description={description}
        image={usdc}
        balance="1,234"
        price="$8.00"
      />
    </Wrapper>
  );
};

const Wrapper = tw.div`flex flex-col gap-15`;
