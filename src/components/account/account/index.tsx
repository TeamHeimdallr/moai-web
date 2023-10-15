import { useRef, useState } from 'react';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import tw, { styled } from 'twin.macro';
import { useOnClickOutside } from 'usehooks-ts';

import { IconGem, IconMetamask } from '~/assets/icons';

import { useConnectedWallet } from '~/hooks/wallets';
import { truncateAddress } from '~/utils/util-string';

import { AccountDetail } from '../account-detail';

export const Account = () => {
  const ref = useRef<HTMLDivElement>(null);

  const [opened, open] = useState(false);
  const toggle = () => open(!opened);

  useOnClickOutside(ref, () => open(false));

  const { evm, xrp } = useConnectedWallet();
  const bothConnected = evm.address && xrp.address;

  return (
    <Wrapper ref={ref}>
      <Banner opened={opened} onClick={toggle}>
        {bothConnected ? (
          <BothConnectedWrapper>
            <ConnectedEvm>
              <IconMetamask width={24} height={24} />
            </ConnectedEvm>
            <ConnectedXrp>
              {/* TODO: change to connected wallet icon */}
              <IconGem width={24} height={24} />
            </ConnectedXrp>
          </BothConnectedWrapper>
        ) : (
          <AccountWrapper>
            <InnerWrapper>
              {/* TODO: icon */}
              <Jazzicon diameter={24} seed={jsNumberForAddress(evm.address || xrp.address || '')} />
            </InnerWrapper>
            <ContentWrapper opened={opened}>
              {truncateAddress(evm.address || xrp.address || '', 4)}
            </ContentWrapper>
          </AccountWrapper>
        )}
      </Banner>
      {opened && <AccountDetail />}
    </Wrapper>
  );
};

const InnerWrapper = tw.div`
  flex-center
`;
const Wrapper = tw.div`
  relative
`;
interface WrapperProps {
  opened?: boolean;
}
const Banner = styled.div<WrapperProps>(({ opened }) => [
  tw`
    relative flex h-40 gap-6 select-none bg-neutral-10 rounded-10 clickable
  `,
  opened ? tw`text-neutral-0` : tw`hover:text-primary-80`,
  opened && tw`bg-neutral-20 hover:bg-neutral-20`,
]);
const AccountWrapper = tw.div`
  flex-center w-136 gap-6 px-8 py-9
`;
const ContentWrapper = styled.div<WrapperProps>(({ opened }) => [
  tw`
    w-full h-full text-center truncate clickable text-neutral-100 font-m-14 address
  `,
  opened ? tw`text-primary-60` : tw`hover:text-primary-80 `,
]);

const BothConnectedWrapper = tw.div`
  flex inline-flex items-center bg-neutral-10 py-9 px-8 rounded-10 relative w-66 h-40
`;
const ConnectedBase = tw.div`
  absolute flex-center w-28 h-28 bg-neutral-20 border-1 border-neutral-15 border-solid rounded-14
`;
const ConnectedEvm = tw(ConnectedBase)`left-9`;
const ConnectedXrp = tw(ConnectedBase)`right-9`;
