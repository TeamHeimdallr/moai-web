import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import tw from 'twin.macro';
import { useOnClickOutside } from 'usehooks-ts';

import { COLOR } from '~/assets/colors';
import { IconNoti } from '~/assets/icons';

import { NotificationCard } from '../notification-card';

export const Notification = () => {
  const ref = useRef<HTMLDivElement>(null);

  const [opened, open] = useState(false);

  const { t } = useTranslation();

  const toggle = () => {
    open(!opened);
  };

  useOnClickOutside(ref, () => open(false));

  // 여기 title 바뀌었음 !! i18n 으로 인해 noti-add 와 같은 식으로 내려와야 합니다.
  const dummyNoti = [
    {
      id: '1',
      title: 'noti-add',
      description: '$0.10 in 20% MOAI, 80% USDC',
      link: '',
    },
    {
      id: '2',
      title: 'noti-withdraw',
      description: '$0.10 in 20% MOAI, 80% USDC',
      link: '',
    },
  ];

  const handleClear = () => {
    //
  };
  // TODO : connect API
  const hasNoti = !opened;

  return (
    <UpperWrapper ref={ref}>
      <NotiWrapper onClick={() => toggle()} opened={opened}>
        {hasNoti && <NotiDot />}
        <IconNoti fill={opened ? '#191B28' : '#F8FFA7'}></IconNoti>
      </NotiWrapper>
      {opened && (
        <Wrapper>
          <Panel>
            <Title>
              <TitleText>{t('Notification')}</TitleText>
            </Title>
            <Divider />
            {/* TODO: empty notification case */}
            {dummyNoti.map(({ id, title, description, link }) => (
              <NotificationCard key={id} title={t(title)} description={description} link={link} />
            ))}
            <ClearWrapper>
              <Clear onClick={() => handleClear()}>{t('Clear transactions')}</Clear>
            </ClearWrapper>
          </Panel>
        </Wrapper>
      )}
    </UpperWrapper>
  );
};

const UpperWrapper = tw.div`
  flex flex-col items-end gap-20 relative z-10
`;

const Wrapper = tw.div`
  min-w-294 max-h-640 min-h-136 bg-neutral-15 rounded-8 absolute right-0 box-shadow-default top-48
`;

interface Props {
  opened: boolean;
}
const NotiWrapper = styled.div<Props>(({ opened }: Props) => [
  tw`relative flex items-start w-40 h-40 gap-6 px-8 py-9 bg-neutral-10 rounded-10 clickable`,
  opened ? tw`bg-neutral-20` : tw` hover:bg-neutral-20`,
  opened
    ? css`
        & > svg path {
          fill: ${COLOR.PRIMARY[60]};
        }
      `
    : css`
        & > svg path {
          fill: ${COLOR.NEUTRAL[60]};
        }
        &:hover > svg path {
          fill: ${COLOR.PRIMARY[80]};
        }
      `,
]);
const NotiDot = tw.div`absolute top-6 right-6 w-6 h-6 bg-red-50 rounded-full`;
const Panel = tw.div`
  flex flex-col items-start bg-neutral-15 rounded-8
`;

const Title = tw.div`
  flex items-start px-16 py-20 gap-8
`;

const TitleText = tw.span`
  text-white font-b-18
`;

const Divider = tw.div`
  w-full h-1 flex-shrink-0 bg-neutral-20
`;

const ClearWrapper = tw.div`
  px-16 py-12 gap-10 rounded-8
`;

const Clear = tw.span`
  font-m-12 text-primary-60 clickable
`;
