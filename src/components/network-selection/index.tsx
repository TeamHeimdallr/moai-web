import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import tw from 'twin.macro';
import { useOnClickOutside } from 'usehooks-ts';

import { NETWORK_IMAGE_MAPPER, NETWORK_SELECT } from '~/constants';

import { useGAAction } from '~/hooks/analaystics/ga-action';
import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { NETWORK, POPUP_ID } from '~/types';

import { ButtonDropdown } from '../buttons/dropdown';
import { DropdownList } from '../dropdown/dropdown-list';
import NetworkAlertPopup from '../popup/network-alert';

export const NetworkSelection = () => {
  const { gaAction } = useGAAction();

  const ref = useRef<HTMLDivElement>(null);
  const [opened, open] = useState(false);

  const { selectedNetwork, selectNetwork } = useNetwork();
  const { opened: openedNetworkAlert } = usePopup(POPUP_ID.NETWORK_ALERT);

  const { t } = useTranslation();

  const toggle = () => open(!opened);

  useOnClickOutside(ref, () => open(false));

  const selectedNetworkDetail =
    NETWORK_SELECT.find(({ network }) => network === selectedNetwork) || NETWORK_SELECT[0];

  const handleSelect = (network: NETWORK) => {
    open(false);

    gaAction({
      action: 'network-selection',
      data: { component: 'gnb', network },
    });
    selectNetwork(network);
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
            <Title>{t('Network Selection')}</Title>
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
      {openedNetworkAlert && <NetworkAlertPopup />}
    </>
  );
};

const Wrapper = tw.div`
  flex flex-col items-end gap-20 z-10 flex-shrink-0
  mlg:relative
`;

const ListOuterWrapper = tw.div`
  min-w-290 bg-neutral-15 rounded-8 absolute top-72 right-20 box-shadow-default
  mlg:(right-0 top-48)
`;

const ListWrapper = tw.div`
  flex flex-col gap-2 p-8
`;

const Title = tw.div`
  p-20 font-b-16 text-neutral-100
  mlg:font-b-18
`;

const Divider = tw.div`
  w-full h-1 bg-neutral-20
`;
