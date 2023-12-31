import { HTMLAttributes, ReactNode } from 'react';
import tw, { css, styled } from 'twin.macro';

import { IconLink } from '~/assets/icons';

import { ButtonIconSmall } from '~/components/buttons';

import { useGAAction } from '~/hooks/analaystics/ga-action';

interface Props extends HTMLAttributes<HTMLDivElement> {
  text: string;
  icon?: ReactNode;

  tableKey?: string;
  link?: string;

  align?: 'flex-start' | 'center' | 'flex-end';
  address?: boolean;
}
export const TableColumnIconTextLink = ({
  text,
  icon,
  link,
  align,
  address,
  tableKey,
  ...rest
}: Props) => {
  const { gaAction } = useGAAction();

  const handleClick = () => {
    if (!link) return;

    gaAction({
      action: 'table-column-icon-text-link',
      text,
      data: { component: 'column-icon-text-link', link, table: tableKey },
    });
    window.open(link);
  };

  return (
    <Wrapper onClick={handleClick} align={align} {...rest}>
      <InnerWrapper address={address}>
        <IconWrapper>{icon}</IconWrapper>
        <TextWrapper>{text}</TextWrapper>
      </InnerWrapper>
      <ButtonIconSmall icon={<IconLink />} />
    </Wrapper>
  );
};

interface WrapperProps {
  align?: 'flex-start' | 'center' | 'flex-end';
  address?: boolean;
}
const Wrapper = styled.div<WrapperProps>(({ align }) => [
  tw`flex items-center gap-4`,
  align &&
    css`
      justify-content: ${align};
    `,
]);

const InnerWrapper = styled.div<WrapperProps>(({ address }) => [
  tw`flex items-center justify-start gap-12 font-r-16 text-neutral-100`,

  address && tw`address`,
]);

const IconWrapper = tw.div`
  flex-center
`;

const TextWrapper = tw.div`
  flex gap-4 items-center
`;
