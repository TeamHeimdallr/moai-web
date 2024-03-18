import { ReactNode } from 'react';
import tw from 'twin.macro';

interface Props {
  image?: ReactNode;

  title?: string;
  titleCaption?: string;

  value?: string;
  valueCaption?: string;

  valueType?: 'medium' | 'large';
}

export const ListItem = ({ image, title, titleCaption, value, valueCaption, valueType }: Props) => {
  return (
    <Wrapper>
      {image && <ImageWrapper>{image}</ImageWrapper>}
      <ContentWrapper>
        <Content>
          <Title>{title}</Title>
          {valueType === 'medium' && <ValueMedium>{value}</ValueMedium>}
          {valueType === 'large' && <ValueLarge>{value}</ValueLarge>}
        </Content>
        <Content>
          <TitleCaption>{titleCaption}</TitleCaption>
          <ValueCaption>{valueCaption}</ValueCaption>
        </Content>
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
  flex flex-col gap-1 w-full
`;

const Content = tw.div`
  flex gap-8 items-center justify-between
`;

const Title = tw.div`
  font-r-14 text-neutral-100
`;

const TitleCaption = tw.div`
  font-r-12 text-neutral-60 address
`;

const ValueMedium = tw.div`
  font-m-14 text-neutral-100
`;

const ValueLarge = tw.div`
  font-m-16 text-neutral-100
`;

const ValueCaption = tw.div`
  font-r-12 text-neutral-60
`;
