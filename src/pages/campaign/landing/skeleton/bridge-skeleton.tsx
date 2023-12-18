import tw from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconArrowDown } from '~/assets/icons';

import { ButtonSkeleton } from '~/components/skeleton/button-skeleton';
import { ListSkeleton } from '~/components/skeleton/list-skeleton';

import { NETWORK } from '~/types';

import 'react-loading-skeleton/dist/skeleton.css';

export const BridgeSkeleton = () => {
  return (
    <Wrapper>
      <ListWrapper>
        <ListSkeleton title="From" network={NETWORK.XRPL} height={152} />
        <IconWrapper>
          <ArrowDownWrapper>
            <IconArrowDown width={20} height={20} fill={COLOR.PRIMARY[50]} />
          </ArrowDownWrapper>
        </IconWrapper>
        <ListSkeleton title="To" network={NETWORK.THE_ROOT_NETWORK} height={106} />
        <ListSkeleton height={94} />
      </ListWrapper>
      <ButtonSkeleton />
    </Wrapper>
  );
};
const Wrapper = tw.div`
  w-full flex flex-col p-24 bg-neutral-10 rounded-12 gap-24
`;
const ListWrapper = tw.div`
  w-full flex flex-col gap-16
`;
const IconWrapper = tw.div`
  absolute absolute-center-x top-168 z-1
`;
const ArrowDownWrapper = tw.div`
  p-6 flex-center rounded-full bg-neutral-30
`;
