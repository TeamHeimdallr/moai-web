import tw from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconArrowDown } from '~/assets/icons';

export const SwapArrowDown = () => {
  return (
    <Wrapper>
      <IconArrowDown width={20} height={20} fill={COLOR.PRIMARY[50]} />
    </Wrapper>
  );
};

const Wrapper = tw.div`
  p-6 flex-center rounded-full bg-neutral-20
`;
