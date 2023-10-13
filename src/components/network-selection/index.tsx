import { useEffect, useRef, useState } from 'react';
import tw from 'twin.macro';
import { useOnClickOutside } from 'usehooks-ts';

import { CHAIN_IMAGE_MAPPER, CHAIN_SELECT_LIST } from '~/constants';

import { useSelectedNetworkStore } from '~/states/data/network/select-network';
import { TOOLTIP_ID } from '~/types';

import { ButtonDropdown } from '../buttons/dropdown';
import { DropdownList } from '../dropdown/dropdown-list';

export const NetworkSelection = () => {
  const hostname = window.location.hostname.split('.');
  const subDomain = hostname[hostname.length - 1 - 2];

  const ref = useRef<HTMLDivElement>(null);
  const [opened, open] = useState(false);

  const { selectedNetwork, selectNetwork } = useSelectedNetworkStore();

  const toggle = () => open(!opened);

  useOnClickOutside(ref, () => open(false));

  const selectedNetworkInfo = CHAIN_SELECT_LIST.find(chain => chain.name === selectedNetwork);
  const name = selectedNetworkInfo?.name ?? 'EMPTY';
  const text = selectedNetworkInfo?.text ?? 'Select network';

  const handleSelect = (name: string) => {
    selectNetwork(name);
    open(false);

    window.location.replace(`https://${name.toLowerCase()}.moai-finance.xyz`);
  };

  useEffect(() => {
    if (subDomain) {
      selectNetwork(name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subDomain, name]);

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
          style={{ minHeight: '40px' }}
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
                  data-tooltip-id={
                    chain.commingSoon ? TOOLTIP_ID.COMMING_SOON_NETWORK_SELECTION : undefined
                  }
                />
              ))}
            </ListWrapper>
          </ListOuterWrapper>
        )}
      </Wrapper>
    </>
  );
};

const Wrapper = tw.div`
  flex flex-col items-end gap-20 relative z-10 flex-shrink-0
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
