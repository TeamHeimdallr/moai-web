import { Trans, useTranslation } from 'react-i18next';
import tw from 'twin.macro';

import { useGAInView } from '~/hooks/analaystics/ga-in-view';

export const LayoutDisclaimer = () => {
  const { ref } = useGAInView({ name: 'campaign-layout-disclaimer' });

  const { t } = useTranslation();
  return (
    <Wrapper ref={ref}>
      <Text>
        <Trans i18nKey="disclaimer-text-1">
          This is link
          <HyperLink
            onClick={() =>
              window.open(
                'https://academy.binance.com/en/articles/impermanent-loss-explained',
                '_blank'
              )
            }
          ></HyperLink>
        </Trans>
      </Text>
      <Text>{t('disclaimer-text-2')}</Text>
      <Text>{t('disclaimer-text-3')}</Text>
      <Text>
        <Trans i18nKey="disclaimer-text-4">
          This is link
          <HyperLink
            onClick={() =>
              window.open(
                'https://docs.moai-finance.xyz/how-to/mission-1-the-voyage-to-the-future/how-to-join-the-campaign',
                '_blank'
              )
            }
          ></HyperLink>
        </Trans>
      </Text>
      <Text>
        <Trans i18nKey="disclaimer-text-5">
          This is link
          <HyperLink
            onClick={() => window.open('https://discord.com/invite/jjF2nhaD', '_blank')}
          ></HyperLink>
          <HyperLink
            onClick={() => window.open('mailto:support@moai-finance.xyz', '_blank')}
          ></HyperLink>
        </Trans>
      </Text>
    </Wrapper>
  );
};
const Wrapper = tw.div`
  w-full flex flex-col text-center px-20 py-40 gap-6 font-r-12 text-neutral-70
`;
const HyperLink = tw.span`
  text-neutral-70 underline clickable
`;
const Text = tw.div``;
