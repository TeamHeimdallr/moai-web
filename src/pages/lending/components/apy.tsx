import { HTMLAttributes } from 'react';
import tw from 'twin.macro';

import { formatNumber } from '~/utils';

interface Props extends HTMLAttributes<HTMLDivElement> {
  apy: number;
}

export const APYLarge = ({ apy, ...rest }: Props) => {
  const sign = apy < 0 ? '-' : '';
  return <WrapperLarge {...rest}>{`${sign}${formatNumber(Math.abs(apy), 2)}%`}</WrapperLarge>;
};

const WrapperLarge = tw.div`
  flex gap-4 flex-center font-m-18 leading-22
  md:(font-m-20)
`;

export const APYMedium = ({ apy, ...rest }: Props) => {
  if (apy < 0.01)
    return (
      <WrapperMedium {...rest}>
        <IconMedium>{'<'}</IconMedium>
        0.01%
      </WrapperMedium>
    );

  return <WrapperMedium {...rest}>{`${formatNumber(apy)}%`}</WrapperMedium>;
};

const WrapperMedium = tw.div`
  flex gap-4 flex-center font-m-16
  md:(font-m-18)
`;

const IconMedium = tw.div`
  text-neutral-60 font-m-16
  md:(font-m-18)
`;

export const APYSmall = ({ apy, ...rest }: Props) => {
  if (apy < 0.01)
    return (
      <WrapperSmall {...rest}>
        <IconSmall>{'<'}</IconSmall>
        0.01%
      </WrapperSmall>
    );

  return <WrapperSmall {...rest}>{`${formatNumber(apy)}%`}</WrapperSmall>;
};

const WrapperSmall = tw.div`
  flex gap-4 flex-center font-r-14
  md:(font-r-16)
`;

const IconSmall = tw.div`
  text-neutral-60 font-r-14
  md:(font-r-16)
`;
