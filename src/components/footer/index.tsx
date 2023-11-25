import tw from 'twin.macro';

import { IconDiscord, IconMedium, IconPaper, IconTwitterX } from '~/assets/icons';
import LogoText from '~/assets/logos/logo-text.svg?react';

import { ButtonIconLarge } from '~/components/buttons/icon';

interface Props {
  inMenu?: boolean;
}
export const Footer = ({ inMenu = false }: Props) => {
  const sns = [
    { name: 'twitter', url: 'https://twitter.com/MoaiFinance', icon: <IconTwitterX /> },
    { name: 'medium', url: 'https://medium.com/@moai-finance', icon: <IconMedium /> },
    { name: 'discord', url: 'https://discord.gg/UARy6esS', icon: <IconDiscord /> },
    { name: 'paper', url: 'https://docs.moai-finance.xyz', icon: <IconPaper /> },
  ];

  return (
    <Wrapper>
      {!inMenu && <LogoText width={70} height={16} />}
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
  w-full px-20 py-40 flex-center flex-col gap-16
`;

const Text = tw.div`
  font-r-14 text-neutral-60
`;
const SnsWrapper = tw.div`
  flex-center gap-8
`;
