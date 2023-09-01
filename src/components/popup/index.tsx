import { ReactNode, useRef } from 'react';
import tw, { styled } from 'twin.macro';
import { useOnClickOutside } from 'usehooks-ts';

import { COLOR } from '~/assets/colors';
import { IconCancel } from '~/assets/icons';
import { usePopup } from '~/hooks/pages/use-popup';

import { ButtonIconLarge } from '../buttons/icon';

interface Props {
  id: string;
  title: string;
  children?: ReactNode;
  button?: ReactNode;
  icon?: ReactNode;
}

export const Popup = ({ id, title, children, button, icon }: Props) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const { close } = usePopup(id);

  useOnClickOutside(popupRef, close);
  return (
    <Wrapper>
      <ContentContainer ref={popupRef}>
        <Header>
          <TitleWrapper>
            <IconWrapper>{icon}</IconWrapper>
            {title}
          </TitleWrapper>

          <ButtonIconLarge onClick={close} icon={<IconCancel fill={COLOR.NEUTRAL[60]} />} />
        </Header>

        <ContentWrapper>{children}</ContentWrapper>

        <Footer>
          <ButtonWrapper>{button}</ButtonWrapper>
        </Footer>
      </ContentContainer>
      <Dim />
    </Wrapper>
  );
};
const Wrapper = tw.div``;
const Dim = tw.div`
  fixed w-screen h-screen bg-neutral-0/60 top-0 left-0
`;
const ContentContainer = tw.div`
  fixed absolute-center bg-neutral-0 w-452 rounded-12 z-1 pop-up-shadow
`;
const Header = tw.div`flex items-center justify-between font-b-20 text-neutral-100 px-24 py-20`;
const TitleWrapper = tw.div`flex-center  gap-8`;
const IconWrapper = tw.div`flex-center`;
const ContentWrapper = tw.div``;

interface FooterProps {
  button?: boolean;
}
const Footer = styled.div<FooterProps>(({ button }) => [
  tw`rounded-b-12`,
  button ? tw`px-24 pb-20` : tw`pb-24`,
]);
const ButtonWrapper = tw.div`flex-center px-24 w-full`;
