import tw from 'twin.macro';

import { IconGem, IconMetamask } from '~/assets/icons';

export const BothConnected = () => {
  return (
    <Wrapper>
      <Metamask>
        <IconWrapper>
          <IconMetamask width={24} height={24} />
        </IconWrapper>
      </Metamask>
      <Gem>
        <IconWrapper>
          <IconGem width={24} height={24} />
        </IconWrapper>
      </Gem>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex inline-flex items-center bg-neutral-10 py-9 px-8 rounded-10 relative w-66 h-40
`;
const Metamask = tw.div`absolute left-9 flex-center w-28 h-28 bg-neutral-20 border-1 border-neutral-15 border-solid rounded-14`;
const Gem = tw.div`absolute right-9 flex-center w-28 h-28 bg-neutral-20 border-1 border-neutral-15 border-solid rounded-14`;
const IconWrapper = tw.div`flex-center`;
