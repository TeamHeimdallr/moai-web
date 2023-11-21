import { HTMLAttributes, ReactNode, useRef } from 'react';
import tw, { styled } from 'twin.macro';
import { useOnClickOutside } from 'usehooks-ts';

import { COLOR } from '~/assets/colors';
import { IconCancel } from '~/assets/icons';

import { usePopup } from '~/hooks/components/use-popup';

import { ButtonIconLarge } from '../buttons/icon';

interface Props extends HTMLAttributes<HTMLDivElement> {
  id: string;
  title: string;
  children?: ReactNode;
  button?: ReactNode;
  icon?: ReactNode;
}

export const Popup = ({ id, title, children, button, icon, ...rest }: Props) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const { close } = usePopup(id);

  useOnClickOutside(popupRef, close);
  return (
    <>
      <ContentContainer ref={popupRef} {...rest}>
        <InnerWrapper>
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
        </InnerWrapper>
      </ContentContainer>
      <Dim />
    </>
  );
};
const Dim = tw.div`
  fixed w-screen h-screen bg-neutral-0/60 top-0 left-0 z-20
`;
const ContentContainer = tw.div`
  absolute-center max-w-452 fixed w-full top-0 left-0 z-21 flex justify-center
  xs:(max-h-[calc(100%-120px)] overflow-y-auto)
  md:(py-0)
`;
const InnerWrapper = tw.div`
  w-full h-full bg-neutral-10 rounded-12 pop-up-shadow
  xs:(overflow-y-auto)
  md:w-452
`;
const Header = tw.div`
  flex items-center justify-between font-b-18 text-neutral-100 px-24 py-20
  md:font-b-20
`;
const TitleWrapper = tw.div`flex-center gap-8`;
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
