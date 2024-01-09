import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import tw from 'twin.macro';

import { IconEnglish, IconKorean } from '~/assets/icons';

import { useGAAction } from '~/hooks/analaystics/ga-action';

export const LanguageChange = () => {
  const { gaLanguageChange } = useGAAction();
  const { i18n } = useTranslation();

  const handleClick = () => {
    i18n.language === 'en' ? i18n.changeLanguage('ko') : i18n.changeLanguage('en');
  };

  useEffect(() => {
    gaLanguageChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  return (
    <Wrapper onClick={handleClick}>
      {i18n.language === 'en' ? <IconEnglish /> : <IconKorean />}
    </Wrapper>
  );
};

const Wrapper = tw.div`
  relative flex items-start w-40 h-40 gap-6 px-8 py-9 bg-neutral-10 rounded-10 clickable
  hover:(bg-neutral-20)
`;
