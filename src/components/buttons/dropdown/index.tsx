import { ButtonHTMLAttributes } from 'react';
import tw, { css, styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconDown } from '~/assets/icons';

interface ButtonDrodDownProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  image?: string;
  imageAlt?: string;
  imageTitle?: string;

  text: string;

  selected?: boolean;
  opened?: boolean;
}

export const ButtonDropdown = ({
  image,
  imageAlt,
  imageTitle,
  text,
  opened,
  ...rest
}: ButtonDrodDownProps) => {
  return (
    <Wrapper opened={opened} {...rest}>
      {image && <Image src={image} alt={imageAlt} title={imageTitle} />}
      <IconTextWrapper>
        {text}
        <Icon opened={opened}>
          <IconDown width={16} height={16} fill={COLOR.NEUTRAL[60]} />
        </Icon>
      </IconTextWrapper>
    </Wrapper>
  );
};
interface Props {
  opened?: boolean;
}
const Wrapper = styled.button<Props>(({ opened }) => [
  tw`
    gap-6 p-8 rounded-10 flex-center text-neutral-100 bg-neutral-10 clickable
    hover:(text-primary-80 bg-neutral-20)
  `,
  css`
    &:hover svg {
      fill: ${COLOR.PRIMARY[80]};
    }
  `,
  opened &&
    css`
      & {
        color: ${COLOR.PRIMARY[60]};
        svg {
          fill: ${COLOR.PRIMARY[60]};
        }
      }
      &:hover {
        color: ${COLOR.PRIMARY[60]};
        svg {
          fill: ${COLOR.PRIMARY[60]};
        }
      }
    `,
]);

const IconTextWrapper = tw.div`gap-4 flex-center font-m-14`;

const Icon = styled.div<Props>(({ opened }) => [
  tw`p-2 transition-transform flex-center`,
  css`
    transform: rotate(${opened ? '-180deg' : '0deg'});
  `,
]);

const Image = tw.img`
  w-24 h-24 flex-center object-cover
`;
