import { useRef, useState } from 'react';
import tw from 'twin.macro';
import { useOnClickOutside } from 'usehooks-ts';

import { NETWORK_IMAGE_MAPPER, NETWORK_SELECT } from '~/constants';

import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { NETWORK, POPUP_ID } from '~/types';

import { ButtonDropdown } from '../buttons/dropdown';
import { DropdownList } from '../dropdown/dropdown-list';
import NetworkAlertPopup from '../popup/network-alert';

export const NetworkSelection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [opened, open] = useState(false);

  const { selectedNetwork, selectNetwork } = useNetwork();
  const [targetNetwork, setTargetNetwork] = useState<NETWORK>(selectedNetwork);

  const { opened: popupOpened, open: popupOpen } = usePopup(POPUP_ID.NETWORK_ALERT);

  const toggle = () => open(!opened);

  useOnClickOutside(ref, () => open(false));

  const selectedNetworkDetail =
    NETWORK_SELECT.find(({ network }) => network === selectedNetwork) || NETWORK_SELECT[0];

  const handleSelect = (network: NETWORK) => {
    setTargetNetwork(network);
    if (network !== selectedNetwork) popupOpen();
    open(false);
  };

  return (
    <>
      <Wrapper ref={ref}>
        <ButtonDropdown
          image={NETWORK_IMAGE_MAPPER[selectedNetwork]}
          imageAlt={selectedNetworkDetail.text}
          imageTitle={selectedNetworkDetail.text}
          text={selectedNetworkDetail.text}
          opened={opened}
          onClick={toggle}
          style={{ minHeight: '40px' }}
        />
        {opened && (
          <ListOuterWrapper>
            <Title>Network Selection</Title>
            <Divider />
            <ListWrapper>
              {NETWORK_SELECT.map(({ network, text }) => (
                <DropdownList
                  key={`${network}-${text}`}
                  id={network}
                  text={text}
                  image={NETWORK_IMAGE_MAPPER[network]}
                  imageAlt={text}
                  imageTitle={text}
                  selected={network === selectedNetwork}
                  handleSelect={() => handleSelect(network)}
                />
              ))}
            </ListWrapper>
          </ListOuterWrapper>
        )}
      </Wrapper>
      {popupOpened && <NetworkAlertPopup onClickButton={() => selectNetwork(targetNetwork)} />}
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
