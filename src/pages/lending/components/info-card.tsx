import { ReactNode } from 'react';
import { css } from '@emotion/react';
import tw, { styled } from 'twin.macro';

interface MarketInfoCardProps {
  title: string;
  titleIcon?: ReactNode;

  iconButton?: ReactNode;

  value: ReactNode;
  valueColor?: string;
  valueIcon?: ReactNode;

  light?: boolean;
}
export const InfoCard = ({
  title,
  titleIcon,
  iconButton,
  value,
  valueColor,
  valueIcon,
  light,
}: MarketInfoCardProps) => {
  return (
    <Wrapper light={light}>
      <TitleOuterWrapper>
        <TitleWrapper>
          {title}
          {titleIcon}
        </TitleWrapper>
        {iconButton && <IconButtonWrapper>{iconButton}</IconButtonWrapper>}
      </TitleOuterWrapper>
      <ValueWrapper color={valueColor}>
        {value}
        {valueIcon}
      </ValueWrapper>
    </Wrapper>
  );
};

interface WrapperProps {
  light?: boolean;
}
const Wrapper = styled.div<WrapperProps>(({ light }) => [
  tw`
    flex flex-1 flex-col items-start bg-neutral-10 rounded-12
    py-16 px-20 gap-12
    md:(py-20 pl-24 pr-12 gap-16)
  `,
  light && tw`bg-neutral-15`,
]);

const TitleOuterWrapper = tw.div`
  w-full flex items-center gap-2
`;
const TitleWrapper = tw.div`
  flex h-24 items-center font-m-14 text-neutral-80 gap-2 flex-1
  md:(h-32 font-m-16)
`;

const IconButtonWrapper = tw.div`
  flex-shrink-0
`;

interface ValueWrapperProps {
  color?: string;
}
const ValueWrapper = styled.div<ValueWrapperProps>(({ color }) => [
  tw`
    font-m-18 text-neutral-100 flex-center gap-4
    md:(font-m-20 leading-26 h-32)
  `,
  color &&
    css`
      color: ${color};
    `,
]);
