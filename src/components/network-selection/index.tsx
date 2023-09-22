import { useRef, useState } from 'react';
import tw from 'twin.macro';
import { useOnClickOutside } from 'usehooks-ts';

import { CHAIN_IMAGE_MAPPER, CHAIN_SELECT_LIST } from '~/constants';

import { useSelectedNetworkStore } from '~/states/data/selected-network';
import { TOOLTIP_ID } from '~/types';

import { ButtonDropdown } from '../buttons/dropdown';
import { DropdownList } from '../dropdown/dropdown-list';
import { TooltipCommingSoon } from '../tooltips/comming-soon';

export const NetworkSelection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [opened, open] = useState(false);

  const { selectedNetwork, selectNetwork } = useSelectedNetworkStore();

  const toggle = () => open(!opened);

  useOnClickOutside(ref, () => open(false));

  const selectedNetworkInfo =
    CHAIN_SELECT_LIST.find(chain => chain.name === selectedNetwork) ?? CHAIN_SELECT_LIST[0];
  const { name, text } = selectedNetworkInfo;

  const handleSelect = (name: string) => {
    selectNetwork(name);
    open(false);
  };

  return (
    <>
      <Wrapper ref={ref}>
        <ButtonDropdown
          image={CHAIN_IMAGE_MAPPER[name.toUpperCase()]}
          imageAlt={text}
          imageTitle={text}
          text={text}
          selected={!!selectedNetwork}
          opened={opened}
          onClick={toggle}
        />
        {opened && (
          <ListOuterWrapper>
            <Title>Network Selection</Title>
            <Divider />
            <ListWrapper>
              {CHAIN_SELECT_LIST.map((chain, i) => (
                <DropdownList
                  key={`${chain.text}-${chain.name}-${i}`}
                  id={chain.name}
                  text={chain.text}
                  image={CHAIN_IMAGE_MAPPER[chain.name]}
                  imageAlt={chain.text}
                  imageTitle={chain.text}
                  selected={chain.name === selectedNetwork}
                  handleSelect={handleSelect}
                  disabled={chain.disabled}
                  data-tooltip-id={chain.commingSoon ? TOOLTIP_ID.COMMING_SOON : undefined}
                />
              ))}
            </ListWrapper>
          </ListOuterWrapper>
        )}
      </Wrapper>
      <TooltipCommingSoon place="bottom" />
    </>
  );
};

const Wrapper = tw.div`
  flex flex-col items-end gap-20 relative z-10
`;

const ListOuterWrapper = tw.div`
  min-w-290 bg-neutral-15 rounded-8 absolute top-60 right-0 box-shadow-default
`;

const ListWrapper = tw.div`
  flex flex-col gap-2 p-8
`;

const Title = tw.div`
  p-20 font-b-18 text-neutral-100
`;

const Divider = tw.div`
  w-full h-1 bg-neutral-20
`;
