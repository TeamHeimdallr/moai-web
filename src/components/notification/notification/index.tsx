import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useRef, useState } from 'react';
import tw from 'twin.macro';
import { useOnClickOutside } from 'usehooks-ts';

import { IconNoti } from '~/assets/icons';
import { SCANNER_URL } from '~/constants';

import { NotificationCard } from '../notification-card';

export const Notification = () => {
  const ref = useRef<HTMLDivElement>(null);

  const [opened, open] = useState(false);

  const toggle = () => {
    open(!opened);
  };

  useOnClickOutside(ref, () => open(false));

  const dummyNoti = [
    {
      id: '1',
      title: 'Add liquidity',
      description: '$0.10 in 20% MOAI, 80% USDC',
      link: SCANNER_URL,
    },
    {
      id: '2',
      title: 'Withdraw',
      description: '$0.10 in 20% MOAI, 80% USDC',
      link: SCANNER_URL,
    },
  ];

  const handleClear = () => {
    console.log('clear transactions');
  };

  return (
    <UpperWrapper ref={ref}>
      <NotiWrapper onClick={() => toggle()} opened={opened}>
        <IconNoti fill={opened ? '#191B28' : '#F8FFA7'}></IconNoti>
      </NotiWrapper>
      {opened && (
        <Wrapper>
          <Panel>
            <Title>
              <TitleText>{'Recent activity'}</TitleText>
            </Title>
            <Divider />
            {/* TODO: empty notification case */}
            {dummyNoti.map(({ id, title, description, link }) => (
              <NotificationCard key={id} title={title} description={description} link={link} />
            ))}
            <ClearWrapper>
              <Clear onClick={() => handleClear()}>Clear transactions</Clear>
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
  min-w-294 max-h-640 min-h-136 bg-neutral-15 rounded-8 absolute top-60 right-0 box-shadow-default
`;

interface Props {
  opened: boolean;
}
const NotiWrapper = styled.div<Props>(({ opened }: Props) => [
  tw`relative flex items-start w-40 h-40 gap-6 px-8 py-9 bg-neutral-10 rounded-10 clickable`,
  opened ? tw` bg-primary-50` : tw` hover:bg-neutral-20`,
  opened
    ? css`
        & > svg path {
          fill: #191b28;
        }
      `
    : css`
        &:hover > svg path {
          fill: #fcffd6;
        }
      `,
]);

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
