import { useRef, useState } from 'react';
import { t } from 'i18next';
import tw, { styled } from 'twin.macro';
import { useOnClickOutside } from 'usehooks-ts';

import { COLOR } from '~/assets/colors';
import { IconSetting } from '~/assets/icons';

import { ROOT_ASSET_ID } from '~/constants';

import { ButtonIconLarge } from '../buttons';

export interface FeeToken {
  name: string;
  assetId: number;
}
interface Props {
  handleSelect: (feeToken: FeeToken) => void;
  selectedToken: FeeToken;
}
export const FeeProxySelector = ({ handleSelect, selectedToken }: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  const [opened, open] = useState(false);
  const toggle = () => open(!opened);
  useOnClickOutside(ref, () => open(false));

  const feeTokens: FeeToken[] = [
    {
      name: 'XRP',
      assetId: ROOT_ASSET_ID.XRP,
    },
    {
      name: 'ROOT',
      assetId: ROOT_ASSET_ID.ROOT,
    },
    {
      name: 'ASTO',
      assetId: ROOT_ASSET_ID.ASTO,
    },
    {
      name: 'SYLO',
      assetId: ROOT_ASSET_ID.SYLO,
    },
    {
      name: 'USDC',
      assetId: ROOT_ASSET_ID.USDC,
    },
  ];

  return (
    <UpperWrapper ref={ref}>
      <ButtonIconLarge onClick={toggle} icon={<IconSetting fill={COLOR.NEUTRAL[60]} />} />
      {opened && (
        <Wrapper>
          <Panel>
            <Title>
              <TitleText>{t('Pay gas fee with')}</TitleText>
            </Title>
            <FeeOptions>
              {feeTokens?.map(token => (
                <FeeOption
                  key={token.name}
                  selected={selectedToken.assetId === token.assetId}
                  onClick={() => handleSelect(token)}
                >
                  {`${token.name}`}
                </FeeOption>
              ))}
            </FeeOptions>
          </Panel>
        </Wrapper>
      )}
    </UpperWrapper>
  );
};

const UpperWrapper = tw.div`
  relative
`;
const Wrapper = tw.div`
  min-w-290 bg-neutral-15 rounded-8 absolute right-0 box-shadow-default z-20
`;
const Panel = tw.div`
  flex flex-col items-start bg-neutral-15 rounded-8 px-16 pt-12 pb-16 gap-8
`;
const Title = tw.div`
  flex justify-between w-full
`;
const TitleText = tw.span`
  text-white font-m-14
`;
const FeeOptions = tw.div`
  flex gap-8 w-full flex-wrap
`;
interface OptionProps {
  selected?: boolean;
  disabled?: boolean;
}
const FeeOption = styled.div<OptionProps>(({ selected, disabled }) => [
  tw`gap-10 px-16 py-6 bg-transparent border-solid rounded-8 text-neutral-60 font-r-16 border-1 border-neutral-60 clickable`,
  !disabled && selected
    ? tw`text-primary-50 border-primary-50 gradient-chip`
    : tw`hover:bg-neutral-20 hover:text-neutral-60 border-neutral-80`,
  disabled && tw`non-clickable`,
]);
