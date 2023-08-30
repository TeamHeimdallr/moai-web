import { HTMLAttributes, ReactNode } from 'react';
import tw, { css, styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconTokens } from '~/assets/icons';

interface Props extends HTMLAttributes<HTMLDivElement> {
  label: string;
  icon?: ReactNode;

  width?: number | 'full';
  align?: 'flex-start' | 'center' | 'flex-end';
}
export const TableHeader = ({ label, icon, width, align, ...rest }: Props) => {
  return (
    <Wrapper width={width} align={align} {...rest}>
      {icon}
      {label}
    </Wrapper>
  );
};

interface WrapperProps {
  width?: number | 'full';
  align?: 'flex-start' | 'center' | 'flex-end';
}
const Wrapper = styled.div<WrapperProps>(({ width, align }) => [
  tw`flex items-center justify-start flex-shrink-0 gap-6 w-120 font-m-16 text-neutral-80`,

  width === 'full' && tw`flex-1 w-full`,
  typeof width === 'number' &&
    css`
      width: ${width}px;
    `,

  align &&
    css`
      justify-content: ${align};
    `,
]);

export const TableHeaderAssets = () => (
  <TableHeader
    label="Assets"
    icon={<IconTokens width={24} height={24} fill={COLOR.NEUTRAL[80]} />}
    width={120}
    align="flex-start"
  />
);

export const TableHeaderComposition = () => (
  <TableHeader label="Composition" width="full" align="flex-start" />
);

export const TableHeaderAPR = () => <TableHeader label="APR" width={160} align="flex-end" />;

export const TableHeaderMyAPR = () => <TableHeader label="My APR" width={160} align="flex-end" />;
