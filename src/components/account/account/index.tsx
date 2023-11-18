import { useRef, useState } from 'react';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import tw, { styled } from 'twin.macro';
import { useOnClickOutside } from 'usehooks-ts';
import { toHex } from 'viem';

import { imageWalletCrossmark, imageWalletGem, imageWalletMetamask } from '~/assets/images';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useMediaQuery } from '~/hooks/utils';
import { useConnectedWallet } from '~/hooks/wallets';
import { truncateAddress } from '~/utils/util-string';

import { AccountDetail } from '../account-detail';

export const Account = () => {
  const ref = useRef<HTMLDivElement>(null);

  const { isMD } = useMediaQuery();

  const [opened, open] = useState(false);
  const toggle = () => open(!opened);

  useOnClickOutside(ref, () => open(false));

  const { isXrp } = useNetwork();
  const { evm, xrp } = useConnectedWallet();
  const bothConnected = evm.address && xrp.address;

  return (
    <Wrapper ref={ref}>
      <Banner opened={opened} onClick={toggle}>
        {bothConnected ? (
          <BothConnectedWrapper>
            <ConnectedXrp>
              {xrp.connectedConnector === 'crossmark' ? (
                <Image src={imageWalletCrossmark} alt="crossmark wallet" />
              ) : (
                <Image src={imageWalletGem} alt="gem wallet" />
              )}
            </ConnectedXrp>
            <ConnectedEvm>
              <Image src={imageWalletMetamask} alt="metamask" />
            </ConnectedEvm>
          </BothConnectedWrapper>
        ) : (
          <AccountWrapper>
            <InnerWrapper>
              <Jazzicon
                diameter={24}
                seed={jsNumberForAddress(
                  isXrp ? toHex(xrp.address || '', { size: 42 }) : evm.address || ''
                )}
              />
            </InnerWrapper>
            {isMD && (
              <ContentWrapper opened={opened}>
                {truncateAddress(evm.address || xrp.address || '', 4)}
              </ContentWrapper>
            )}
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
  flex-center gap-6 px-8 py-9
  sm:w-40 
  md:w-136
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
const ConnectedEvm = tw(ConnectedBase)`right-9`;
const ConnectedXrp = tw(ConnectedBase)`left-9`;

const Image = tw.img`
  w-24 h-24 object-cover flex-center
`;
