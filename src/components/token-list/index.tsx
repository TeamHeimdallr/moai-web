import { HTMLAttributes, ReactNode } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import tw, { css, styled } from 'twin.macro';

interface Props extends HTMLAttributes<HTMLDivElement> {
  image: string | ReactNode;
  title: string;

  type?: 'selectable' | 'campaign' | 'medium' | 'large';
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
          {balance && <Balance type={type}>{balance}</Balance>}
          {value && <Value type={type}>{value}</Value>}
        </RightWrapper>
      )}
    </Wrapper>
  );
};
interface DivProps {
  type: 'selectable' | 'campaign' | 'medium' | 'large';
  backgroundColor?: string;
  selected?: boolean;
}
const Wrapper = styled.div<DivProps>(({ type, backgroundColor, selected }) => [
  tw`w-full flex items-center justify-between gap-10`,
  backgroundColor &&
    css`
      background-color: ${backgroundColor};
    `,
  type === 'selectable'
    ? tw`border-transparent border-solid px-11 py-7 rounded-8 border-1 hover:bg-neutral-20 clickable`
    : type === 'medium'
    ? tw`px-24 py-8`
    : type === 'campaign'
    ? tw`px-16 py-12`
    : tw`px-24 py-12`,
  type === 'selectable' &&
    (selected
      ? tw`border-solid border-1 border-primary-60 bg-primary-20 hover:bg-primary-20`
      : tw``),
]);
const LeftWrapper = tw.div`flex-center gap-12`;
const Image = tw(LazyLoadImage)`w-36 h-36 rounded-18 shrink-0`;

interface TextProps {
  type: 'selectable' | 'campaign' | 'medium' | 'large';
}

const TitleWrapper = tw.div`flex flex-col flex-1`;
const Title = styled.div<TextProps>(({ type }) => [
  type === 'large' ? tw`font-r-18` : type === 'campaign' ? tw`font-r-14` : tw`font-r-16`,
  tw`text-neutral-100`,
]);
const SubTitle = styled.div<TextProps>(({ type }) => [
  type === 'large' ? tw`font-r-18` : type === 'campaign' ? tw`font-r-14` : tw`font-r-16`,
  tw`text-neutral-60`,
]);
const TitleInnerWrapper = tw.div`flex gap-8`;
const Description = styled.div<TextProps>(({ type }) => [
  tw`font-r-14`,
  type === 'selectable' ? tw`text-neutral-90` : tw`text-neutral-60`,
]);

const RightWrapper = tw.div`flex flex-col shrink-0`;
const Balance = styled.div<TextProps>(({ type }) => [
  type === 'large' ? tw`font-m-20` : type === 'campaign' ? tw`font-m-18` : tw`font-m-16`,
  tw`text-right text-neutral-100`,
]);
const Value = styled.div<TextProps>(({ type }) => [
  type === 'large' ? tw`font-r-14` : type === 'campaign' ? tw`font-r-14` : tw`font-r-12`,
  tw`text-right text-neutral-60`,
]);
