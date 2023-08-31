import { HTMLAttributes } from 'react';
import tw from 'twin.macro';

import { IconLink } from '~/assets/icons';

interface Props extends HTMLAttributes<HTMLDivElement> {
  title: string;
  link: string;
  description: string;
}
export const NotificationCard = ({ title, link, description, ...rest }: Props) => {
  const handleClick = () => {
    window.open(link);
  };

  return (
    <Wrapper {...rest}>
      <TitleWrapper>
        <Title>{title}</Title>
        <IconWrapper>
          <IconLink onClick={() => handleClick()} fill="#9296AD" />
        </IconWrapper>
      </TitleWrapper>
      <Description>{' ' + description}</Description>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col px-16 py-12 bg-neutral-15
`;

const TitleWrapper = tw.div`
  flex items-center gap-4
`;

const Title = tw.span`
  font-m-16 text-white inline
`;

const Description = tw.span`
  font-r-14 text-neutral-80 inline
`;

const IconWrapper = tw.div`
  clickable items-center flex
`;
