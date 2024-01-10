import { HTMLAttributes, ReactNode } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import tw, { css, styled } from 'twin.macro';

import { formatNumber } from '~/utils';
import { IToken } from '~/types';

interface Props extends HTMLAttributes<HTMLDivElement> {
  token: string;
  balance: number;

  value?: number;
  showValue?: boolean;

  convertedToken?: IToken;
  convertedBalance?: number;
  image?: ReactNode;
  transparent?: boolean;
  button?: ReactNode;
}

export const TokenListVertical = ({
  token,
  balance,
  value,
  showValue = true,
  convertedToken,
  convertedBalance,
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
          <Balance>{formatNumber(balance, 6)}</Balance>
          {/* compare value whether undefined or not, since value could be 0 */}
          {showValue && (
            <Value>
              {value !== undefined && (
                <>
                  ${formatNumber(value, 2)}{' '}
                  {convertedBalance
                    ? `(≈${formatNumber(convertedBalance)} ${convertedToken?.symbol})`
                    : ''}
                </>
              )}
            </Value>
          )}
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
  tw`
    w-full flex flex-col gap-24 bg-neutral-15 rounded-12
    p-20
    md:(p-24)
  `,
  transparent &&
    css`
      background-color: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(2px);
    `,
]);
const TokenWrapper = tw.div`
  flex-col gap-16 font-r-16
`;
const Token = tw.div`
  flex items-center gap-12 text-neutral-100
  font-r-16
  md:(font-r-18)
`;

const Image = tw(LazyLoadImage)`
  w-36 h-36 rounded-18
`;
const Description = tw.div`
  flex-col items-center mt-16
`;
const Balance = tw.div`
  text-neutral-100 font-m-18
  md:(font-m-20)
`;
const Value = tw.div`
  text-neutral-80 font-r-12 h-22
  md:(font-r-14)
`;
const ButtonWrapper = tw.div``;
