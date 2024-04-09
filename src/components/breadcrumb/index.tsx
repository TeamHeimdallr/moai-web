import { Fragment, HTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';
import tw, { styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import IconNext from '~/assets/icons/icon-next.svg?react';

export interface BreadcrumbItem {
  key: string;
  text: string;

  selected?: boolean;
}

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'css'> {
  items: BreadcrumbItem[];
  handleClick: (item: BreadcrumbItem) => void;

  type?: 'large' | 'small';
}
export const Breadcrumb = ({ items, handleClick, ...rest }: Props) => {
  const { t } = useTranslation();

  return (
    <Wrapper {...rest}>
      {items.map(({ key, text, selected }, idx: number) => (
        <Fragment key={key}>
          <Item selected={selected} onClick={() => handleClick({ key, text, selected })}>
            {t(text)}
          </Item>

          {idx < items.length - 1 && <IconNext width={16} height={16} fill={COLOR.NEUTRAL[40]} />}
        </Fragment>
      ))}
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex items-center gap-8
`;

interface ItemProps {
  type?: 'large' | 'small';
  selected?: boolean;
}
const Item = styled.div<ItemProps>(({ type, selected }) => [
  tw`
    clickable font-r-12 text-neutral-60 transition-colors
    hover:(text-primary-80)
  `,
  selected && tw`text-primary-60 hover:(text-primary-60)`,
  type === 'large' && tw`font-r-14`,
]);
