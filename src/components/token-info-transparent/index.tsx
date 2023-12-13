import { ReactNode } from 'react';
import tw, { css, styled } from 'twin.macro';

interface TokenInfoProps {
  token: string;
  icon: ReactNode;
  balance: string;
  value: string;
  button?: ReactNode;
}

export const TokenInfo = ({ token, icon, balance, value, button }: TokenInfoProps) => {
  return (
    <Wrapper>
      <TokenWrapper>
        <TokenNameWrapper>
          {icon}
          <TokenName>{token}</TokenName>
        </TokenNameWrapper>
        <TokenInfoWrapper>
          <Balance>{balance}</Balance>
          <Value>{value}</Value>
        </TokenInfoWrapper>
      </TokenWrapper>
      {button && <ButtonWrapper>{button}</ButtonWrapper>}
    </Wrapper>
  );
};

const Wrapper = styled.div(() => [
  tw`w-full flex flex-col gap-24 p-20 rounded-12
  md:p-24
  `,
  css`
    background-color: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(2px);
  `,
]);
const TokenWrapper = tw.div`flex justify-between items-center`;
const TokenName = tw.div`font-r-16 text-neutral-100
  md:font-r-18
`;
const TokenNameWrapper = tw.div`flex gap-12 items-center`;
const TokenInfoWrapper = tw.div`flex flex-col justify-center items-end`;
const Balance = tw.div`font-m-18 text-neutral-100
  md:font-m-20
`;
const Value = tw.div`font-r-12 text-neutral-80
  md:font-r-14
`;
const ButtonWrapper = tw.div``;
