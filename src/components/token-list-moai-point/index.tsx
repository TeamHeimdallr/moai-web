import { HTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import tw from 'twin.macro';

import { IconNext, IconTokenMoai } from '~/assets/icons';

import { TRILLION } from '~/constants';

import { ButtonPrimarySmallIconTrailing } from '~/components/buttons/primary/small-icon-trailing';

import { formatNumber } from '~/utils';

interface Props extends HTMLAttributes<HTMLDivElement> {
  veMOAI?: number;
  moaiPoint?: number;
}

export const TokenListMoaiPoint = ({ veMOAI, moaiPoint, ...rest }: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Wrapper {...rest}>
      <TokenWrapper>
        <Token>
          <IconTokenMoai width={36} height={36} />
          {t('Moai Rewards')}
        </Token>
        <ButtonWrapper>
          <ButtonPrimarySmallIconTrailing
            text={t('View details')}
            icon={<IconNext />}
            onClick={() => navigate('/rewards')}
          />
        </ButtonWrapper>
      </TokenWrapper>
      <Description>
        <Balance>
          {typeof veMOAI === 'string' ? '-' : formatNumber(moaiPoint, 2, 'floor', TRILLION, 2)}
          <Value>{t('Points')}</Value>
        </Balance>

        <Balance>
          {typeof moaiPoint === 'string' ? '-' : formatNumber(veMOAI, 2, 'floor', TRILLION, 2)}
          <Value>{t('veMOAI')}</Value>
        </Balance>
      </Description>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-full h-full flex flex-col gap-16 bg-neutral-15 rounded-12
  p-20
  md:(p-24)
`;

const TokenWrapper = tw.div`
  flex gap-12 items-center justify-between
`;
const Token = tw.div`
  w-full flex flex-1 items-center gap-12 text-neutral-100
  font-r-16
  md:(font-r-18)
`;

const ButtonWrapper = tw.div``;

const Description = tw.div`
  flex flex-col gap-12
`;
const Balance = tw.div`
  flex flex-col text-neutral-100 font-m-18
  md:(font-m-20)
`;
const Value = tw.div`
  text-neutral-70 font-r-12 h-22
  md:(font-r-14)
`;
