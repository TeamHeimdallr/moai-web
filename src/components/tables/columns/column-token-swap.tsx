import { HTMLAttributes } from 'react';
import tw from 'twin.macro';

import { IconArrowNext } from '~/assets/icons';
import { Token } from '~/components/token';
import { TokenInfo } from '~/types/components';
import { TOKEN } from '~/types/contracts';

interface Props extends HTMLAttributes<HTMLDivElement> {
  tokens: TokenInfo[];
}
export const TableColumnTokenSwap = ({ tokens, ...rest }: Props) => {
  const tokenA = tokens[0];
  const tokenB = tokens[1];
  console.log(tokens);
  return (
    <Wrapper {...rest}>
      <Token
        key={tokenA.name}
        title={tokenA.balance.toString()}
        token={tokenA.name as TOKEN}
        image={true}
        type="small"
      />
      <IconWrapper>
        <IconArrowNext width={20} height={20} />
      </IconWrapper>
      <Token
        key={tokenB.name}
        title={tokenB.balance.toString()}
        token={tokenB.name as TOKEN}
        image={true}
        type="small"
      />
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-full flex flex-1 gap-8 items-center h-32
`;
const IconWrapper = tw.div`flex-center`;
