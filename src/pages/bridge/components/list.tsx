import { ReactNode } from 'react';
import tw, { styled } from 'twin.macro';

interface Props {
  image?: ReactNode;

  title?: string;
  titleCaption?: string;

  value?: string;
  valueCaption?: string;

  type?: 'medium' | 'large';
  valueType?: 'medium' | 'large';
}

export const ListItem = ({
  type,
  image,
  title,
  titleCaption,
  value,
  valueCaption,
  valueType,
}: Props) => {
  return (
    <Wrapper>
      {image && <ImageWrapper>{image}</ImageWrapper>}
      <ContentWrapper>
        <Content>
          <Title type={type}>{title}</Title>
          <TitleCaption type={type}>{titleCaption}</TitleCaption>
        </Content>
        <ContentRight>
          {valueType === 'medium' && <ValueMedium>{value}</ValueMedium>}
          {valueType === 'large' && <ValueLarge>{value}</ValueLarge>}
          <ValueCaption>{valueCaption}</ValueCaption>
        </ContentRight>
      </ContentWrapper>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex gap-12 items-center
`;

const ImageWrapper = tw.div`
  flex-center
`;

const ContentWrapper = tw.div`
  flex justify-between w-full
`;

const Content = tw.div`
  flex flex-col justify-center 
`;
const ContentRight = tw.div`
  flex flex-col items-end
`;

interface TextProps {
  type?: 'medium' | 'large';
}
const Title = styled.div<TextProps>(({ type }) => [
  tw`
    font-r-18 text-neutral-100 leading-26
  `,
  type === 'medium' && tw`font-r-14`,
]);

interface TextProps {
  type?: 'medium' | 'large';
}
const TitleCaption = styled.div<TextProps>(({ type }) => [
  tw`
    font-r-14 text-neutral-60 address
  `,
  type === 'medium' && tw`font-r-12`,
]);
const ValueMedium = tw.div`
  font-m-14 text-neutral-100
`;

const ValueLarge = tw.div`
  font-m-16 text-neutral-100
`;

const ValueCaption = tw.div`
  font-r-12 text-neutral-60
`;
