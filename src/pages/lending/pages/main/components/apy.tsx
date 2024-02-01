import tw from 'twin.macro';

import { formatNumber } from '~/utils';

interface Props {
  apy: number;
}

export const APYLarge = ({ apy }: Props) => {
  if (apy < 0.01)
    return (
      <WrapperLarge>
        <IconLarge>{'<'}</IconLarge>
        0.01%
      </WrapperLarge>
    );

  return <WrapperLarge>{`${formatNumber(apy, 2)}%`}</WrapperLarge>;
};

const WrapperLarge = tw.div`
  flex gap-4 flex-center font-m-18 leading-22
  md:(font-m-20)
`;

const IconLarge = tw.div`
  text-neutral-60 font-m-18 leading-22
  md:(font-m-20)
`;

export const APYMedium = ({ apy }: Props) => {
  if (apy < 0.01)
    return (
      <WrapperMedium>
        <IconMedium>{'<'}</IconMedium>
        0.01%
      </WrapperMedium>
    );

  return <WrapperMedium>{`${formatNumber(apy, 2)}%`}</WrapperMedium>;
};

const WrapperMedium = tw.div`
  flex gap-4 flex-center font-m-16
  md:(font-m-18)
`;

const IconMedium = tw.div`
  text-neutral-60 font-m-16
  md:(font-m-18)
`;

export const APYSmall = ({ apy }: Props) => {
  if (apy < 0.01)
    return (
      <WrapperSmall>
        <IconSmall>{'<'}</IconSmall>
        0.01%
      </WrapperSmall>
    );

  return <WrapperSmall>{`${formatNumber(apy, 2)}%`}</WrapperSmall>;
};

const WrapperSmall = tw.div`
  flex gap-4 flex-center font-r-14
  md:(font-r-16)
`;

const IconSmall = tw.div`
  text-neutral-60 font-r-14
  md:(font-r-16)
`;
