import { HTMLAttributes } from 'react';
import tw, { css, styled } from 'twin.macro';

import { IconLink } from '~/assets/icons';

import { ButtonIconSmall } from '~/components/buttons';

import { useGAAction } from '~/hooks/analaystics/ga-action';

interface Props extends HTMLAttributes<HTMLDivElement> {
  token: string;

  tableKey?: string;
  link?: string;

  align?: 'flex-start' | 'center' | 'flex-end';
}
export const TableColumnLink = ({ token, link, align, tableKey, ...rest }: Props) => {
  const { gaAction } = useGAAction();

  const handleClick = () => {
    if (!link) return;

    gaAction({
      action: 'table-column-link',
      data: { component: 'column-link', link, table: tableKey },
    });
    window.open(link);
  };

  return (
    <Wrapper align={align} onClick={handleClick} {...rest}>
      <TextWrapper>
        {token}
        <ButtonIconSmall icon={<IconLink />} />
      </TextWrapper>
    </Wrapper>
  );
};

interface WrapperProps {
  align?: 'flex-start' | 'center' | 'flex-end';
}
const Wrapper = styled.div<WrapperProps>(({ align }) => [
  tw`w-full flex items-center justify-start flex-shrink-0 gap-12 font-r-16 text-neutral-100`,

  align &&
    css`
      justify-content: ${align};
    `,
]);

const TextWrapper = tw.div`
  flex gap-4 items-center
`;
