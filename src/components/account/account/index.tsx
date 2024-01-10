import { useRef, useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import tw, { styled } from 'twin.macro';
import { useOnClickOutside } from 'usehooks-ts';

import {
  imageWalletCrossmark,
  imageWalletFuturepass,
  imageWalletGem,
  imageWalletMetamask,
  imageWalletXumm,
} from '~/assets/images';

import { useMediaQuery } from '~/hooks/utils';
import { useConnectedWallet } from '~/hooks/wallets';
import { truncateAddress } from '~/utils/util-string';

import { AccountDetail } from '../account-detail';

export const Account = () => {
  const ref = useRef<HTMLDivElement>(null);

  const { isLG } = useMediaQuery();

  const [opened, open] = useState(false);
  const toggle = () => open(!opened);

  useOnClickOutside(ref, () => open(false));

  const { evm, fpass, xrp } = useConnectedWallet();

  const connectedWalletCount =
    (evm.address ? 1 : 0) + (xrp.address ? 1 : 0) + (fpass.address ? 1 : 0);

  return (
    <Wrapper ref={ref}>
      <Banner opened={opened} onClick={toggle}>
        {connectedWalletCount > 1 ? (
          <BothConnectedWrapper
            style={{ width: connectedWalletCount === 3 ? 88 : 66 }}
            opened={opened}
          >
            {xrp.address && (
              <ConnectedXrp>
                {xrp.connectedConnector === 'crossmark' ? (
                  <Image src={imageWalletCrossmark} alt="crossmark wallet" />
                ) : xrp.connectedConnector === 'xumm' ? (
                  <Image src={imageWalletXumm} alt="xumm wallet" />
                ) : xrp.connectedConnector === 'gem' ? (
                  <Image src={imageWalletGem} alt="gem wallet" />
                ) : (
                  <></>
                )}
              </ConnectedXrp>
            )}
            {fpass.address && (
              <ConnectedRoot tripleConnected={connectedWalletCount === 3}>
                <Image src={imageWalletFuturepass} alt="futurepass" />
              </ConnectedRoot>
            )}
            {evm.address && (
              <ConnectedEvm>
                <Image src={imageWalletMetamask} alt="metamask" />
              </ConnectedEvm>
            )}
          </BothConnectedWrapper>
        ) : (
          <AccountWrapper>
            <InnerWrapper>
              <ConnectedBase>
                {evm.address && <Image src={imageWalletMetamask} alt="metamask" />}
                {xrp.connectedConnector === 'crossmark' ? (
                  <Image src={imageWalletCrossmark} alt="crossmark wallet" />
                ) : xrp.connectedConnector === 'xumm' ? (
                  <Image src={imageWalletXumm} alt="xumm wallet" />
                ) : xrp.connectedConnector === 'gem' ? (
                  <Image src={imageWalletGem} alt="gem wallet" />
                ) : (
                  <></>
                )}
              </ConnectedBase>
            </InnerWrapper>
            {isLG && (
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
  relative flex-center gap-6 px-8 py-9 hover:bg-neutral-20 rounded-10 w-40
  lg:(w-full pr-16)
`;

const ContentWrapper = styled.div<WrapperProps>(({ opened }) => [
  tw`
    w-full h-full text-center truncate clickable text-neutral-100 font-m-14 address
  `,
  opened ? tw`text-primary-60` : tw`hover:text-primary-80 `,
]);

const BothConnectedWrapper = styled.div<WrapperProps>(({ opened }) => [
  tw`
    flex inline-flex items-center bg-neutral-10 py-9 px-8 rounded-10 relative h-40 hover:bg-neutral-20
  `,
  opened && tw`bg-neutral-20`,
]);
const ConnectedBase = tw.div`
  flex-center w-28 h-28 bg-neutral-0 border-1 border-neutral-10 border-solid rounded-14
`;
const ConnectedEvm = tw(ConnectedBase)`absolute right-9`;
const ConnectedXrp = tw(ConnectedBase)`absolute left-9`;
interface DivProps {
  tripleConnected?: boolean;
}
const ConnectedRoot = styled.div<DivProps>(({ tripleConnected }) => [
  tw`absolute flex-center w-28 h-28 bg-neutral-0 border-1 border-neutral-10 border-solid rounded-14`,
  tripleConnected ? tw`absolute-center` : tw`left-9`,
]);

const Image = tw(LazyLoadImage)`
  w-20 h-20 object-cover flex-center rounded-full
`;

const InnerWrapper = tw.div`flex-center`;
