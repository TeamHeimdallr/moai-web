import { HTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';
import tw, { css, styled } from 'twin.macro';

import { IconLink } from '~/assets/icons';

import { ButtonIconSmall } from '~/components/buttons';

interface Props extends HTMLAttributes<HTMLDivElement> {
  token: string;
  link?: string;

  align?: 'flex-start' | 'center' | 'flex-end';
}
export const TableColumnLink = ({ token, link, align, ...rest }: Props) => {
  const handleClick = () => {
    if (!link) return;
    window.open(link);
  };

  const { t } = useTranslation();

  return (
    <Wrapper align={align} onClick={handleClick} {...rest}>
      <TextWrapper>
        {t(token)}
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
