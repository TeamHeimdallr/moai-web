import { HTMLAttributes } from 'react';
import tw, { css, styled } from 'twin.macro';

interface Props extends HTMLAttributes<HTMLDivElement> {
  image: string;
  title: string;

  type?: 'selectable' | 'medium' | 'large';
  description?: string;
  balance?: string;
  price?: string;

  backgroundColor?: string;
  selected?: boolean;
}
export const TokenList = ({
  image,
  title,
  type = 'large',
  description,
  balance,
  price,

  backgroundColor,
  selected,
  ...rest
}: Props) => {
  return (
    <Wrapper {...rest} type={type} backgroundColor={backgroundColor} selected={selected}>
      <LeftWrapper>
        <Image src={image} />
        <TitleWrapper>
          <Title type={type}>{title}</Title>
          <Description type={type}>{description}</Description>
        </TitleWrapper>
      </LeftWrapper>

      <RightWrapper>
        <Balance type={type}>{balance}</Balance>
        <Price type={type}>{price}</Price>
      </RightWrapper>
    </Wrapper>
  );
};
interface DivProps {
  type: 'selectable' | 'medium' | 'large';
  backgroundColor?: string;
  selected?: boolean;
}
const Wrapper = styled.div<DivProps>(({ type, backgroundColor, selected }) => [
  tw`flex justify-between items-center`,
  type === 'selectable' &&
    (selected ? tw`border-1 border-solid border-primary-60 bg-primary-20` : tw`bg-neutral-10`),
  type === 'selectable'
    ? tw`px-12 py-8 rounded-8 hover:bg-neutral-20 clickable`
    : type === 'medium'
    ? tw`px-24 py-8`
    : tw`px-24 py-12`,
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
const Description = styled.div<TextProps>(({ type }) => [
  type === 'large' ? tw`font-r-16` : tw`font-r-14`,
  type === 'selectable' ? tw`text-neutral-90` : tw`text-neutral-60`,
]);

const RightWrapper = tw.div`flex flex-col items-end`;
const Balance = styled.div<TextProps>(({ type }) => [
  type === 'large' ? tw`font-m-20` : tw`font-m-16`,
  tw`text-neutral-100`,
]);
const Price = styled.div<TextProps>(({ type }) => [
  type === 'large' ? tw`font-r-14` : tw`font-r-12`,
  tw`text-neutral-60`,
]);
