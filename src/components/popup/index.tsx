import { HTMLAttributes, ReactNode, useRef } from 'react';
import { css } from '@emotion/react';
import tw, { styled } from 'twin.macro';
import { useOnClickOutside } from 'usehooks-ts';

import { COLOR } from '~/assets/colors';
import { IconCancel } from '~/assets/icons';

import { BREAKPOINT } from '~/constants';

import { usePopup } from '~/hooks/components/use-popup';
import { useMediaQuery } from '~/hooks/utils';

import { ButtonIconLarge } from '../buttons/icon';

interface Props extends HTMLAttributes<HTMLDivElement> {
  id: string;
  title: string;
  children?: ReactNode;
  button?: ReactNode;
  icon?: ReactNode;
  setting?: ReactNode;

  disableClose?: boolean;
  maxWidth?: number;

  zIndex?: number;
  handleClose?: () => void;
}

export const Popup = ({
  id,
  title,
  children,
  button,
  icon,
  setting,
  disableClose,
  handleClose: handleCloseProp,
  maxWidth,
  zIndex,
  ...rest
}: Props) => {
  const { isMD } = useMediaQuery();
  const popupRef = useRef<HTMLDivElement>(null);
  const { close } = usePopup(id);

  const handleClose = () => {
    if (disableClose) return;
    handleCloseProp?.();
    close();
  };
  useOnClickOutside(popupRef, handleClose);

  return (
    <>
      <ContentContainer ref={popupRef} maxWidth={maxWidth} zIndex={zIndex} {...rest}>
        <InnerWrapper>
          <Header>
            <TitleWrapper>
              {icon && <IconWrapper>{icon}</IconWrapper>}
              {title}
            </TitleWrapper>

            <Buttons>
              {setting}
              <ButtonIconLarge
                onClick={handleClose}
                icon={<IconCancel fill={COLOR.NEUTRAL[60]} />}
              />
            </Buttons>
          </Header>

          <ContentWrapper>{children}</ContentWrapper>

          <Footer>{button && <ButtonWrapper>{button}</ButtonWrapper>}</Footer>
        </InnerWrapper>
      </ContentContainer>
      {isMD && <Dim zIndex={zIndex} />}
    </>
  );
};

interface DimProps {
  zIndex?: number;
}
const Dim = styled.div<DimProps>(({ zIndex }) => [
  tw`
    fixed w-screen h-screen bg-neutral-0/60 top-0 left-0 z-20
  `,
  css`
    backdrop-filter: blur(2px);
  `,
  zIndex &&
    css`
      z-index: ${zIndex - 1};
    `,
]);

interface ContentContainerProps {
  maxWidth?: number;
  zIndex?: number;
}
const ContentContainer = styled.div<ContentContainerProps>(({ maxWidth, zIndex }) => [
  tw`
    absolute-center fixed w-full top-0 left-0 z-21 flex justify-center
    xs:(h-full)
    md:(py-0 h-auto max-w-455)
  `,
  zIndex &&
    css`
      z-index: ${zIndex};
    `,
  maxWidth &&
    css`
      @media ${BREAKPOINT.MEDIA_MD} {
        max-width: ${maxWidth}px !important;
      }
    `,
]);
const InnerWrapper = tw.div`
  w-full h-full bg-neutral-10 pop-up-shadow
  xs:(overflow-y-auto)
  md:(rounded-12)
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
const Buttons = tw.div`flex`;
