import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import tw from 'twin.macro';

import { ButtonPrimaryLarge } from '~/components/buttons';
import { Footer } from '~/components/footer';
import { Gnb } from '~/components/gnb';

const MaintenancePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Wrapper>
      <InnerWrapper>
        <GnbWrapper>
          <Gnb />
        </GnbWrapper>
        <ContentWrapper>
          <ContentInnerWrapper>
            <TitleWrapper>
              <Title>{t('maintenance-title')}</Title>
              <Description>{t('maintenance-message')}</Description>
            </TitleWrapper>
            <ButtonWrapper>
              <ButtonPrimaryLarge text={t('Go Back')} onClick={() => navigate(-1)} />
            </ButtonWrapper>
          </ContentInnerWrapper>

          <Footer />
        </ContentWrapper>
      </InnerWrapper>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-full h-full bg-landing bg-cover bg-center
`;
const InnerWrapper = tw.div`
  relative w-full h-full overflow-y-auto
`;
const GnbWrapper = tw.div`
  fixed top-0 w-full z-1
`;

const ContentWrapper = tw.div`
  relative flex flex-col h-full justify-between items-center
`;
const ContentInnerWrapper = tw.div`
  relative w-full h-full flex-center flex-col gap-32 py-200
`;

const TitleWrapper = tw.div`
  flex flex-col gap-4 items-center
`;

const Title = tw.div`
  font-b-20 text-neutral-100
`;
const Description = tw.div`
  font-r-16 text-neutral-80
`;

const ButtonWrapper = tw.div`
  flex-center
`;

export default MaintenancePage;
