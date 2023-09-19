import { HTMLAttributes, ReactNode } from 'react';
import tw, { css, styled } from 'twin.macro';

interface Props extends HTMLAttributes<HTMLDivElement> {
  image: string | ReactNode;
  title: string;

  type?: 'selectable' | 'medium' | 'large';
  description?: string;
  balance?: string;
  value?: string;

  backgroundColor?: string;
  selected?: boolean;
  leftAlign?: boolean;
  subTitle?: string;
}
export const TokenList = ({
  image,
  title,
  subTitle = '',
  type = 'large',
  description,
  balance,
  value,

  backgroundColor,
  selected,
  leftAlign = false,
  ...rest
}: Props) => {
  return (
    <Wrapper {...rest} type={type} backgroundColor={backgroundColor} selected={selected}>
      <LeftWrapper>
        {typeof image === 'string' ? <Image src={image} /> : image}
        <TitleWrapper>
          <TitleInnerWrapper>
            <Title type={type}>{title}</Title>
            {subTitle && <SubTitle type={type}>{subTitle}</SubTitle>}
          </TitleInnerWrapper>
          <Description type={type}>{description}</Description>
        </TitleWrapper>
      </LeftWrapper>

      {!leftAlign && (
        <RightWrapper>
          <Balance type={type}>{balance}</Balance>
          <Value type={type}>{value}</Value>
        </RightWrapper>
      )}
    </Wrapper>
  );
};
interface DivProps {
  type: 'selectable' | 'medium' | 'large';
  backgroundColor?: string;
  selected?: boolean;
}
const Wrapper = styled.div<DivProps>(({ type, backgroundColor, selected }) => [
  tw`flex items-center justify-between gap-10`,

  type === 'selectable'
    ? tw`border-transparent border-solid px-11 py-7 rounded-8 border-1 hover:bg-neutral-20 clickable`
    : type === 'medium'
    ? tw`px-24 py-8`
    : tw`px-24 py-12`,
  type === 'selectable' &&
    (selected
      ? tw`border-solid border-1 border-primary-60 bg-primary-20 hover:bg-primary-20`
      : tw`bg-neutral-10`),

  backgroundColor &&
    css`
      background-color: ${backgroundColor};
    `,
]);
const LeftWrapper = tw.div`flex-center gap-12`;
const Image = tw.img`w-36 h-36 rounded-18`;

interface TextProps {
  type: 'selectable' | 'medium' | 'large';
}

const TitleWrapper = tw.div`flex flex-col`;
const Title = styled.div<TextProps>(({ type }) => [
  type === 'large' ? tw`font-r-18` : tw`font-r-16`,
  tw`text-neutral-100`,
]);
const SubTitle = styled.div<TextProps>(({ type }) => [
  type === 'large' ? tw`font-r-18` : tw`font-r-16`,
  tw`text-neutral-60`,
]);
const TitleInnerWrapper = tw.div`flex gap-8`;
const Description = styled.div<TextProps>(({ type }) => [
  tw`font-r-14`,
  type === 'selectable' ? tw`text-neutral-90` : tw`text-neutral-60`,
]);

const RightWrapper = tw.div`flex flex-col flex-1 truncate`;
const Balance = styled.div<TextProps>(({ type }) => [
  type === 'large' ? tw`font-m-20` : tw`font-m-16`,
  tw`text-right truncate text-neutral-100`,
]);
const Value = styled.div<TextProps>(({ type }) => [
  type === 'large' ? tw`font-r-14` : tw`font-r-12`,
  tw`text-right truncate text-neutral-60`,
]);
