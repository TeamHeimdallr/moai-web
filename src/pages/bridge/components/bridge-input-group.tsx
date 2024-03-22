import { Suspense, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { css } from '@emotion/react';
import { yupResolver } from '@hookform/resolvers/yup';
import { isEmpty } from 'lodash-es';
import tw, { styled } from 'twin.macro';
import * as yup from 'yup';

import { COLOR } from '~/assets/colors';
import { IconArrowDown, IconDown } from '~/assets/icons';

import { NETWORK_IMAGE_MAPPER } from '~/constants';

import { ButtonPrimaryLarge } from '~/components/buttons';
import { DropdownList } from '~/components/dropdown';
import { InputNumber } from '~/components/inputs';
import { List } from '~/components/lists';
import { SkeletonBase } from '~/components/skeleton/skeleton-base';
import { Token } from '~/components/token';

import { TooltipAddress } from '~/pages/campaign/components/tooltip-address';

import { useGAAction } from '~/hooks/analaystics/ga-action';
import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useOnClickOutside } from '~/hooks/utils';
import { useConnectedWallet } from '~/hooks/wallets';
import { truncateAddress } from '~/utils';
import { POPUP_ID, TOOLTIP_ID } from '~/types/components';

import { useBalance } from '../hooks/use-balance';
import { useSelectNetwork } from '../hooks/use-select-network';
import { useSelectToken } from '../hooks/use-select-token';
import { getNetworkName } from '../utils/network-name';

import { BridgePopup } from './bridge-popup';
import { SelectFromTokenPopup } from './select-from-token-popup';

interface InputFormState {
  input: number;
}

export const BridgeInputGroup = () => {
  return (
    <Suspense fallback={<_BridgeInputGroupSkeleton />}>
      <_BridgeInputGroup />
    </Suspense>
  );
};
const _BridgeInputGroup = () => {
  const { gaAction } = useGAAction();

  const { isEvm, isFpass } = useNetwork();
  const { t } = useTranslation();

  const [input, setInput] = useState<number | undefined>(undefined);

  const [arrowHover, setArrowHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [error, setError] = useState(false);

  const [openFromNetwork, setOpenFromNetwork] = useState(false);
  const [openToNetwork, setOpenToNetwork] = useState(false);

  const fromNetworkRef = useRef<HTMLDivElement>(null);
  const toNetworkRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(fromNetworkRef, () => setOpenFromNetwork(false));
  useOnClickOutside(toNetworkRef, () => setOpenToNetwork(false));

  const { from, to, selectNetwork, switchNetwork } = useSelectNetwork();
  const { selectableToken, token } = useSelectToken();
  const { balances } = useBalance();

  const currentTokenWithBalance = balances.find(b => b.symbol === token.symbol);
  const currentBalance = currentTokenWithBalance?.balance || 0;
  const currentValue = currentBalance * (currentTokenWithBalance?.price || 0);

  const { opened: bridgeOpened, open: openBridge } = usePopup(POPUP_ID.BRIDGE);
  const { opened: bridgeSelectTokenOpened, open: openBridgeSelectToken } = usePopup(
    POPUP_ID.BRIDGE_SELECT_TOKEN
  );

  const { evm, xrp, fpass } = useConnectedWallet();

  const evmAddress = isFpass ? fpass?.address : isEvm ? evm?.address : evm?.address;
  const evmDestination = isFpass
    ? to === 'ETHEREUM'
      ? evm?.address
      : fpass?.address
    : isEvm
    ? evm?.address
    : evm?.address;
  const xrpAddress = xrp?.address || '';
  const destination = to === 'XRPL' ? xrpAddress : evmDestination;

  const schema = yup.object().shape({
    input: yup.number().min(0).max(currentBalance, t('Exceeds wallet balance')).required(),
  });

  const { control, setValue, formState } = useForm<InputFormState>({
    resolver: yupResolver(schema),
  });

  const getValidToBridge = () => {
    const evm = ['ETHEREUM', 'THE_ROOT_NETWORK'];
    const xrp = ['XRPL'];

    if (formState.errors.input || !input || input <= 0) return false;

    // evm to evm
    if (evm.includes(from) && evm.includes(to)) return !!evmAddress;
    // evm to xrp or xrp to evm
    if ((evm.includes(from) && xrp.includes(to)) || (xrp.includes(from) && evm.includes(to)))
      return !!evmAddress && !!xrpAddress;
    // xrp to xpr - cannot happen
    return true;
  };

  const arrowClick = () => {
    gaAction({
      action: 'switch-bridge-from-to',
      data: {
        page: 'bridge',
        prevFromNetwork: from,
        prevToNetwork: to,
        nextFromNetwork: to,
        nextToNetwork: from,
        token: 'XRP',
      },
    });

    switchNetwork();
  };

  const allNetworks = [
    { id: 'XRPL', selectable: true },
    // { id: 'ETHEREUM', selectable: true },
    { id: 'THE_ROOT_NETWORK', selectable: true },
  ];
  const fromSelectableNetwork = allNetworks.map(({ id }) => ({
    id: id,
    selectable: id !== to,
  }));
  const toSelectableNetwork = allNetworks.map(({ id }) => ({
    id: id,
    selectable: id !== from,
  }));

  return (
    <>
      <Wrapper>
        <InputWrapper>
          <ListWrapper>
            <List
              title={t('From')}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              network={from as any}
              // networkSelectIcon={
              //   <ButtonIconSmall icon={<IconDown />} onClick={() => setOpenFromNetwork(true)} />
              // }
              focus
              focused={focus}
              error={error}
            >
              <InputNumber
                token={
                  <Token
                    token={token.symbol}
                    icon={
                      selectableToken.length > 1 && (
                        <TokenIconWrapper>
                          <IconDown width={16} height={16} fill={COLOR.NEUTRAL[60]} />
                        </TokenIconWrapper>
                      )
                    }
                    iconWrapper={false}
                    image
                    imageUrl={token.image}
                    onClick={() => {
                      if (selectableToken.length <= 1) return;
                      openBridgeSelectToken();
                    }}
                  />
                }
                tokenValue={currentValue}
                balance={currentBalance}
                value={input}
                maxButton
                handleChange={setInput}
                name={'input'}
                control={control}
                setValue={setValue}
                formState={formState}
                focus={false}
                blured={false}
                autoFocus={false}
                sliderActive
                slider
                handleFocus={() => setFocus(true)}
                handleBlur={() => setFocus(false)}
                handleError={(errorMessage: string) => setError(!!errorMessage)}
              />
            </List>
            {openFromNetwork && (
              <Dropdown ref={fromNetworkRef}>
                {fromSelectableNetwork.map(({ id, selectable }) => (
                  <DropdownList
                    key={id}
                    id={id}
                    text={getNetworkName(id)}
                    image={NETWORK_IMAGE_MAPPER[id]}
                    handleSelect={() => {
                      selectNetwork('from', id);
                      setOpenFromNetwork(false);
                    }}
                    selected={id === from}
                    disabled={!selectable}
                  />
                ))}
              </Dropdown>
            )}
          </ListWrapper>
          <IconWrapper
            onClick={() => arrowClick()}
            onMouseEnter={() => setArrowHover(true)}
            onMouseLeave={() => setArrowHover(false)}
          >
            <ArrowDownWrapper hover={arrowHover}>
              <IconArrowDown width={20} height={20} fill={COLOR.PRIMARY[50]} />
            </ArrowDownWrapper>
          </IconWrapper>
          <ListWrapper>
            <List
              title={t('To')}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              network={to as any}
              // networkSelectIcon={
              //   <ButtonIconSmall icon={<IconDown />} onClick={() => setOpenToNetwork(true)} />
              // }
            >
              <ToWrapper>
                <ToTitle>{t('Account')}</ToTitle>
                <ToValue data-tooltip-id={TOOLTIP_ID.ADDRESS}>
                  {destination ? truncateAddress(destination, to === 'XRPL' ? 6 : 4) : '-'}
                </ToValue>
              </ToWrapper>
            </List>
            {openToNetwork && (
              <Dropdown ref={toNetworkRef}>
                {toSelectableNetwork.map(({ id, selectable }) => (
                  <DropdownList
                    key={id}
                    id={id}
                    text={getNetworkName(id)}
                    image={NETWORK_IMAGE_MAPPER[id]}
                    handleSelect={() => {
                      selectNetwork('to', id);
                      setOpenToNetwork(false);
                    }}
                    selected={id === to}
                    disabled={!selectable}
                  />
                ))}
              </Dropdown>
            )}
          </ListWrapper>
        </InputWrapper>

        <ButtonPrimaryLarge
          text={t('Preview')}
          disabled={!getValidToBridge()}
          onClick={() => openBridge()}
        />
      </Wrapper>
      {bridgeSelectTokenOpened && !isEmpty(balances) && (
        <SelectFromTokenPopup currentToken={currentTokenWithBalance} tokens={balances} />
      )}
      {bridgeOpened && (
        <BridgePopup
          amount={input || 0}
          value={(input || 0) * (currentTokenWithBalance?.price || 0)}
        />
      )}
      <TooltipAddress address={destination} />
    </>
  );
};

const _BridgeInputGroupSkeleton = () => {
  return (
    <Wrapper>
      <InputWrapper>
        <SkeletonBase height={108} />
        <IconWrapper>
          <ArrowDownWrapper>
            <IconArrowDown width={20} height={20} fill={COLOR.PRIMARY[50]} />
          </ArrowDownWrapper>
        </IconWrapper>
        <SkeletonBase height={108} />
      </InputWrapper>
      <SkeletonBase height={40} borderRadius={12} style={{ marginTop: 36 }} />
    </Wrapper>
  );
};

const Wrapper = tw.div`
   w-full flex flex-col flex-shrink-0 rounded-12 bg-neutral-10 gap-20 p-20
   md:(w-455 p-24 gap-24)
`;

const InputWrapper = tw.div`
  flex flex-col gap-16 relative
`;
const ListWrapper = tw.div`
  relative
`;

const IconWrapper = tw.div`
  absolute absolute-center-x bottom-86 z-2 clickable select-none
`;

interface ArrowDownWrapperProps {
  hover?: boolean;
}
const ArrowDownWrapper = styled.div<ArrowDownWrapperProps>(({ hover }) => [
  tw`
    p-6 flex-center rounded-full bg-neutral-20 transition-transform
  `,
  hover &&
    css`
      transform: rotate(180deg);
    `,
]);

const ToWrapper = tw.div`
  flex justify-between bg-neutral-15 gap-16 px-16 py-12
`;

const ToTitle = tw.div`
  text-neutral-100 font-r-14
`;

const ToValue = tw.div`
  text-neutral-100 font-m-14 address
`;

const Dropdown = tw.div`
  absolute top-44 right-16 flex flex-col gap-2 z-4
  w-240 bg-neutral-15 rounded-8 box-shadow-default
`;

const TokenIconWrapper = tw.div`
  w-24 h-24 p-4 flex-center
`;
