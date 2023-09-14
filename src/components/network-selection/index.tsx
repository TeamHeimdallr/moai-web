import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useRef, useState } from 'react';
import tw from 'twin.macro';
import { useOnClickOutside } from 'usehooks-ts';

import { COLOR } from '~/assets/colors';
import { IconDown } from '~/assets/icons';
import { CHAIN_IMAGE_MAPPER, CHAIN_SELECT_LIST } from '~/constants';
import { useSelectedNetworkStore } from '~/states/components/selected-network';

import { DropdownList } from '../dropdown/dropdown-list';

export const NetworkSelection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [opened, open] = useState(false);

  const { selectedNetwork, selectNetwork } = useSelectedNetworkStore();

  const toggle = () => open(!opened);

  useOnClickOutside(ref, () => open(false));

  const selectedNetworkInfo =
    CHAIN_SELECT_LIST.find(chain => chain.id === selectedNetwork) ?? CHAIN_SELECT_LIST[0];
  const { text } = selectedNetworkInfo;

  const handleSelect = (id: number) => {
    selectNetwork(id);
    open(false);
  };

  return (
    <Wrapper ref={ref}>
      <DropdownButton onClick={toggle}>
        <Image src={CHAIN_IMAGE_MAPPER[selectedNetworkInfo.id]} />
        <IconTextWrapper>
          {text}
          <Icon>
            <IconDown width={16} height={16} fill={COLOR.NEUTRAL[60]} />
          </Icon>
        </IconTextWrapper>
      </DropdownButton>

      {opened && (
        <ListOuterWrapper>
          <ListWrapper>
            {CHAIN_SELECT_LIST.map(chain => (
              <DropdownList
                key={`${chain.text}-${chain.id}`}
                id={chain.id}
                text={chain.text}
                image={CHAIN_IMAGE_MAPPER[chain.id]}
                imageAlt={chain.text}
                imageTitle={chain.text}
                selected={chain.id === selectedNetwork}
                handleSelect={handleSelect}
                disabled={chain.disabled}
              />
            ))}
          </ListWrapper>
        </ListOuterWrapper>
      )}
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col items-end gap-20 relative z-10
`;

const DropdownButton = styled.div(() => [
  tw`
    gap-6 p-8 rounded-10 flex-center flex-center text-neutral-100 bg-neutral-10 clickable
    hover:(text-neutral-80 bg-neutral-20)
  `,
]);

const IconTextWrapper = tw.div`
  flex-center gap-4 font-m-14
`;

const Icon = tw.div`
  p-2 flex-center
`;

const Image = tw.img`
  w-24 h-24 flex-center object-cover
`;

const ListOuterWrapper = tw.div`
  min-w-290 bg-neutral-15 rounded-8 absolute top-60 right-0 box-shadow-default
`;

const ListWrapper = tw.div`
  flex flex-col gap-2 p-8
`;
