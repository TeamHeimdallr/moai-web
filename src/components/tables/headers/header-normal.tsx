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

interface TooltipProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  tooltipIcon?: ReactNode;

  align?: 'flex-start' | 'center' | 'flex-end';
}

export const TableHeaderTooltip = ({ label, tooltipIcon, align, ...rest }: TooltipProps) => {
  const { t } = useTranslation();
  return (
    <TooltipWrapper align={align} {...rest}>
      {t(label)}
      {tooltipIcon}
    </TooltipWrapper>
  );
};

interface WrapperProps {
  align?: 'flex-start' | 'center' | 'flex-end';
}
const TooltipWrapper = styled.div<WrapperProps>(({ align }) => [
  tw`
    flex-center w-full gap-2 font-m-14 text-neutral-80
    md:(font-m-16)
  `,

  align &&
    css`
      justify-content: ${align};
    `,
]);
