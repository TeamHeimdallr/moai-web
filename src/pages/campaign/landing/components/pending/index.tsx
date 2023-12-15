import { useTranslation } from 'react-i18next';
import tw, { styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconLink, IconNext } from '~/assets/icons';

import { ButtonPrimaryMediumIconTrailing } from '~/components/buttons';
import { ButtonPrimaryLargeIconTrailing } from '~/components/buttons/primary/large-icon-trailing';

import { useMediaQuery } from '~/hooks/utils';

export const Pending = () => {
  // TODO : connect API
  // TODO : navigate step3
  const handleClick = () => {};
  const { t } = useTranslation();
  const { isMD } = useMediaQuery();
  return (
    <Wrapper>
      <TitleWrapper>
        <Title>Pending</Title>
        <LinkWrapper>
          {t('Last application at') + ' ' + t('days ago', { time: 3 })}
          <IconWrapper>
            <IconLink width={16} height={16} fill={COLOR.NEUTRAL[60]} />
          </IconWrapper>
        </LinkWrapper>
      </TitleWrapper>

      <ButtonWrapper>
        {isMD ? (
          <ButtonPrimaryLargeIconTrailing
            icon={<IconNext fill={COLOR.NEUTRAL[0]} width={20} height={20} />}
            text={t('continue-campaign')}
            onClick={handleClick}
          />
        ) : (
          <ButtonPrimaryMediumIconTrailing
            icon={<IconNext fill={COLOR.NEUTRAL[0]} width={20} height={20} />}
            text={t('continue-campaign')}
            onClick={handleClick}
          />
        )}
      </ButtonWrapper>
    </Wrapper>
  );
};

const Wrapper = styled.div(() => [
  tw`w-full flex flex-col justify-between items-start gap-20 bg-neutral-10 rounded-12 px-24 pt-20 pb-24
  md:(flex-row items-center mt-24)
  `,
]);
const TitleWrapper = tw.div`flex flex-col items-start font-m-20 gap-4 text-neutral-100 
  md:gap-8
`;
const Title = tw.div`
  flex-1 font-b-18 md:font-b-20
`;
const LinkWrapper = tw.div`flex items-center font-m-14 gap-2
  md:font-m-16
`;
const IconWrapper = tw.div`flex flex-center clickable w-24 h-24`;
const ButtonWrapper = tw.div``;
