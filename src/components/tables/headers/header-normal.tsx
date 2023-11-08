import { HTMLAttributes, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import tw, { css, styled } from 'twin.macro';

interface Props extends HTMLAttributes<HTMLDivElement> {
  label: string;
  icon?: ReactNode;

  align?: 'flex-start' | 'center' | 'flex-end';
}

export const TableHeader = ({ label, icon, align, ...rest }: Props) => {
  const { t } = useTranslation();
  return (
    <Wrapper align={align} {...rest}>
      {icon}
      {t(label)}
    </Wrapper>
  );
};

interface WrapperProps {
  align?: 'flex-start' | 'center' | 'flex-end';
}
const Wrapper = styled.div<WrapperProps>(({ align }) => [
  tw`flex items-center justify-start w-full gap-6 w-120 font-m-16 text-neutral-80`,

  align &&
    css`
      justify-content: ${align};
    `,
]);

export const TableHeaderComposition = () => <TableHeader label="Composition" align="flex-start" />;

export const TableHeaderAPR = () => <TableHeader label="APR" align="flex-end" />;

export const TableHeaderMyAPR = () => <TableHeader label="My APR" align="flex-end" />;
