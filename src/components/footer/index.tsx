import tw from 'twin.macro';

import { IconDiscord, IconTelegram, IconTwitter } from '~/assets/icons';
import { ReactComponent as LogoText } from '~/assets/logos/logo-text.svg';

import { ButtonIconLarge } from '~/components/buttons/icon';

export const Footer = () => {
  // TODO: sns link
  const sns = [
    { name: 'twitter', url: 'https://twitter.com/MoaiFinance', icon: <IconTwitter /> },
    { name: 'discord', url: '#', icon: <IconDiscord /> },
    { name: 'telegram', url: '#', icon: <IconTelegram /> },
  ];

  return (
    <Wrapper>
      <LogoText width={70} height={16} />
      <Text>{`© ${new Date().getFullYear()} Moai Finance, Inc. All Rights Reserved`}</Text>
      <SnsWrapper>
        {sns.map(({ name, url, icon }) => (
          <ButtonIconLarge key={name} title={name} icon={icon} onClick={() => window.open(url)} />
        ))}
      </SnsWrapper>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  px-48 py-40 flex-center flex-col gap-16
`;

const Text = tw.div`
  font-r-14 text-neutral-90
`;
const SnsWrapper = tw.div`
  flex-center gap-8
`;
