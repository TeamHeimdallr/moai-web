import { css } from '@emotion/react';
import { HTMLAttributes } from 'react';
import tw, { styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconCancel, IconLink } from '~/assets/icons';
import { ButtonIconLarge, ButtonIconMedium } from '~/components/buttons/icon';

interface Props extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  handleClick?: () => void;
  handleClose?: () => void;
}

export const ToastNotification = ({ title, description, handleClick, handleClose }: Props) => {
  return (
    <Wrapper>
      <TitleWrapper>
        <TitleInnerWrapper onClick={handleClick}>
          {title}
          <ButtonIconMedium icon={<IconLink />} />
        </TitleInnerWrapper>
        <ButtonIconLarge icon={<IconCancel />} onClick={handleClose} />
      </TitleWrapper>
      <Description>{description}</Description>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col
`;

const TitleWrapper = tw.div`
  flex gap-8 items-center justify-between
`;

const TitleInnerWrapper = styled.div(() => [
  tw`flex items-center gap-4 transition-colors font-m-14 text-neutral-100 clickable`,
  css`
    & svg {
      width: 16px;
      height: 16px;
      fill: ${COLOR.NEUTRAL[60]};
    }

    &:hover svg {
      fill: ${COLOR.NEUTRAL[100]};
    }
  `,
]);

const Description = tw.div`
  font-r-14 text-neutral-80
`;
