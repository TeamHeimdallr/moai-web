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
  const [tokenA, tokenB] = tokens;

  if (!tokenA || !tokenB) return <></>;
  return (
    <Wrapper {...rest}>
      <Token
        key={tokenA.name}
        title={`${Number(tokenA.balance.toFixed(6))}`}
        token={tokenA.name as TOKEN}
        image={true}
        type="small"
      />
      <IconWrapper>
        <IconArrowNext width={20} height={20} />
      </IconWrapper>
      <Token
        key={tokenB.name}
        title={`${Number(tokenB.balance.toFixed(6))}`}
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
