import { HTMLAttributes, ReactNode } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import tw from 'twin.macro';

import { formatNumber, formatNumberWithComma } from '~/utils';

interface Props extends HTMLAttributes<HTMLDivElement> {
  token: string;
  balance: number;
  value: number;
  image?: ReactNode;
}

export const TokenList = ({ token, balance, value, image, ...rest }: Props) => {
  return (
    <Wrapper {...rest}>
      <Token>
        {typeof image === 'string' ? <Image src={image} /> : image}
        {token}
      </Token>
      <Description>
        <Balance>{formatNumberWithComma(balance)}</Balance>
        <Value>${formatNumber(value, 2)}</Value>
      </Description>
    </Wrapper>
  );
};
const Wrapper = tw.div`w-full flex items-center gap-16 p-20 bg-neutral-15 rounded-12 md:p-24 `;

const Token = tw.div`flex items-center gap-12 font-r-16`;

const Image = tw(LazyLoadImage)`w-36 h-36 rounded-18`;
const Description = tw.div`flex flex-1 flex-col items-end justify-center`;
const Balance = tw.div`font-m-20 text-neutral-100`;
const Value = tw.div`font-r-14 text-neutral-70`;
