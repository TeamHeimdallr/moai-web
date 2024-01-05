import { useTranslation } from 'react-i18next';
import tw from 'twin.macro';

export const PotentialRisks = () => {
  const { t, i18n } = useTranslation();
  const { language } = i18n;

  const handleClick = () => {
    window.open('https://docs.moai-finance.xyz/protocol-risks/protocol-risks');
  };

  return (
    <Wrapper>
      <Title>{t('Potential risks')}</Title>
      <Content>
        {language === 'en' ? (
          <Content>
            {`Take care and stay mindful of the `}
            <Link onClick={handleClick}>potential risks</Link>
            {` that you might face`}
          </Content>
        ) : (
          <Content>
            {`노출될 수 있는 `}
            <Link onClick={handleClick}>잠재적 위험요인</Link>
            {`에 주의하세요.`}
          </Content>
        )}
      </Content>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col bg-neutral-10 rounded-12 px-24 py-20 gap-12
`;

const Title = tw.div`
  font-b-20 text-neutral-100
`;

const Content = tw.div`
  font-m-16 text-neutral-80
`;

const Link = tw.span`
  underline underline-offset-2 clickable
`;
