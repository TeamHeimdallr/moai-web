import { HTMLAttributes, ReactNode } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import tw, { css, styled } from 'twin.macro';

import { formatNumber, formatNumberWithComma } from '~/utils';

interface Props extends HTMLAttributes<HTMLDivElement> {
  token: string;
  balance: number;
  value: number;
  image?: ReactNode;
  transparent?: boolean;
  button?: ReactNode;
}

export const TokenList = ({
  token,
  balance,
  value,
  image,
  transparent,
  button,
  ...rest
}: Props) => {
  return (
    <Wrapper transparent={transparent} {...rest}>
      <TokenWrapper>
        <Token>
          {typeof image === 'string' ? <Image src={image} /> : image}
          {token}
        </Token>
        <Description>
          <Balance>{formatNumberWithComma(balance)}</Balance>
          <Value>${formatNumber(value, 2)}</Value>
        </Description>
      </TokenWrapper>
      {button && <ButtonWrapper>{button}</ButtonWrapper>}
    </Wrapper>
  );
};
interface WrapperProps {
  transparent?: boolean;
}
const Wrapper = styled.div<WrapperProps>(({ transparent }) => [
  tw`w-full flex flex-col gap-24 p-20 bg-neutral-15 rounded-12 
  md:p-24
  `,
  transparent &&
    css`
      background-color: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(2px);
    `,
]);
const TokenWrapper = tw.div`flex items-center justify-between gap-12 font-r-16`;
const Token = tw.div`flex items-center gap-12 font-r-16 text-neutral-100
  md:font-r-18
`;

const Image = tw(LazyLoadImage)`w-36 h-36 rounded-18`;
const Description = tw.div`flex flex-1 flex-col items-end justify-center`;
const Balance = tw.div`font-m-18 text-neutral-100
  md:font-m-20
`;
const Value = tw.div`font-r-12 text-neutral-80
  md:font-r-14
`;
const ButtonWrapper = tw.div``;
