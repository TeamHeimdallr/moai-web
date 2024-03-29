import { ButtonHTMLAttributes } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import tw, { css, styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconDown } from '~/assets/icons';

import { useMediaQuery } from '~/hooks/utils';

export interface ButtonDrodDownProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  image?: string;
  imageAlt?: string;
  imageTitle?: string;

  text: string;

  selected?: boolean;
  opened?: boolean;

  enableTextBreakpoint?: boolean;
}

export const ButtonDropdown = ({
  image,
  imageAlt,
  imageTitle,
  text,
  opened,
  enableTextBreakpoint = true,
  ...rest
}: ButtonDrodDownProps) => {
  const { isMLG } = useMediaQuery();

  return (
    <Wrapper opened={opened} {...rest}>
      {image && <Image src={image} alt={imageAlt} title={imageTitle} />}
      <IconTextWrapper>
        {enableTextBreakpoint ? isMLG && <Text>{text}</Text> : <Text>{text}</Text>}
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
    gap-6 p-8 rounded-10 flex-center text-neutral-100 clickable bg-neutral-10
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
  opened && tw`bg-neutral-20`,
]);

const IconTextWrapper = tw.div`gap-4 flex-center`;

const Icon = styled.div<Props>(({ opened }) => [
  tw`py-2 transition-transform flex-center`,
  css`
    transform: rotate(${opened ? '-180deg' : '0deg'});
  `,
]);

const Text = tw.div`font-m-14`;

const Image = tw(LazyLoadImage)`
  flex-center object-cover w-20 h-20
  md:(w-24 h-24)
`;
