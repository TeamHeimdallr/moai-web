import { useTranslation } from 'react-i18next';
import Skeleton from 'react-loading-skeleton';
import tw from 'twin.macro';

export const MyVoyageSkeleton = () => {
  const { t } = useTranslation();

  return (
    <Wrapper>
      <Title>{t('My Voyage')}</Title>
      <Skeleton
        height={194}
        baseColor="#2B2E44"
        highlightColor="#23263A"
        style={{ borderRadius: 12 }}
      />
    </Wrapper>
  );
};
const Wrapper = tw.div`
  w-full flex flex-col justify-center pt-60 gap-24 text-neutral-100 mb-120 md:px-20 xxl:px-80
`;
const Title = tw.div`
  px-20 font-b-20 md:font-b-24 text-neutral-100
`;
