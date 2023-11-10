import { HTMLAttributes } from 'react';
import tw, { styled } from 'twin.macro';

import { TOKEN_IMAGE_MAPPER } from '~/constants';

import { formatNumber, formatNumberWithComma } from '~/utils';

interface Props extends HTMLAttributes<HTMLDivElement> {
  token: string;
  balance: number;
  value: number;
  type?: 'medium' | 'large';
}

export const TokenList = ({ token, balance, value, type = 'large', ...rest }: Props) => {
  return (
    <Wrapper type={type} {...rest}>
      <Token>
        <Image src={TOKEN_IMAGE_MAPPER[token]} /> {token}
      </Token>
      <Description>
        <Balance>{formatNumberWithComma(balance)}</Balance>
        <Value>${formatNumber(value, 2)}</Value>
      </Description>
    </Wrapper>
  );
};
interface DivProps {
  type: 'medium' | 'large';
}
const Wrapper = styled.div<DivProps>(({ type }) => [
  tw`flex items-center gap-16 p-24 bg-neutral-15 rounded-12`,
  type == 'medium' ? tw`w-362` : tw`w-383`,
]);

const Token = tw.div`flex items-center gap-12 font-r-16`;

const Image = tw.img`w-36 h-36 rounded-18`;
const Description = tw.div`flex flex-1 flex-col items-end justify-center`;
const Balance = tw.div`font-m-20 text-neutral-100`;
const Value = tw.div`font-r-14 text-neutral-70`;
