import { HTMLAttributes, SyntheticEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import tw, { styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconCheck } from '~/assets/icons';

import { ButtonDropdown } from '~/components/buttons';

import { useOnClickOutside } from '~/hooks/utils';

interface Type {
  apyType: string;
  apy: number;
}
interface Props extends HTMLAttributes<HTMLDivElement> {
  address: string; // asset address
  type: Type;
  types: Type[];
  handleClick?: (address: string, apyType: string, apy: number) => void;
}
export const TableColumnDropdownLendingApyType = ({
  address,
  type: currentType,
  types,
  handleClick,
  ...rest
}: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [opened, open] = useState(false);
  const toggle = (e: SyntheticEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    open(!opened);
  };

  const { t } = useTranslation();

  useOnClickOutside([ref], () => open(false));

  const onClick = (e: SyntheticEvent<HTMLDivElement>, apyType: string, apy: number) => {
    e.stopPropagation();
    if (apyType === currentType.apyType) return;

    handleClick?.(address, apyType, apy);
    open(false);
  };

  return (
    <Wrapper ref={ref}>
      <InnerWrapper>
        <ButtonDropdown
          text={t(currentType.apyType)}
          onClick={e => toggle(e)}
          style={{ paddingLeft: '16px' }}
          enableTextBreakpoint={false}
        />
        {opened && (
          <ListOuterWrapper {...rest}>
            <Title>{t('Select APY type to switch')}</Title>
            <Divider />
            <ListWrapper>
              {types.map(({ apyType, apy }) => (
                <List
                  key={apyType}
                  onClick={e => onClick(e, apyType, apy)}
                  disabled={apyType === currentType.apyType}
                >
                  <Text grow>{t(`lending-apy-${apyType}`)}</Text>
                  <Text>{`${apy}%`}</Text>
                  <IconWrapper>
                    {apyType === currentType.apyType && (
                      <IconCheck width={24} height={24} fill={COLOR.GREEN[50]} />
                    )}
                  </IconWrapper>
                </List>
              ))}
            </ListWrapper>
          </ListOuterWrapper>
        )}
      </InnerWrapper>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex-center flex-shrink-0
`;
const InnerWrapper = tw.div`
  flex flex-col items-center flex-shrink-0 relative
`;

const ListOuterWrapper = tw.div`
  w-290 bg-neutral-15 rounded-8 absolute top-48 right-0 box-shadow-default
`;

const ListWrapper = tw.div`
  flex flex-col gap-2 p-8
`;

const Title = tw.div`
  p-16 font-b-16 text-neutral-100
`;

const Divider = tw.div`
  w-full h-1 bg-neutral-20
`;

interface ListWrapper {
  disabled?: boolean;
}
const List = styled.div<ListWrapper>(({ disabled }) => [
  tw`
    w-full pl-12 pr-8 py-8 flex gap-8 rounded-8 clickable select-none
    hover:(bg-neutral-20)
  `,
  disabled && tw`opacity-50 non-clickable`,
]);

interface TextProps {
  grow?: boolean;
}
const Text = styled.div<TextProps>(({ grow }) => [
  tw`flex flex-1 font-r-16 text-neutral-100 flex-shrink-0`,
  grow && tw`flex-1`,
]);

const IconWrapper = tw.div`
  w-24 h-24 flex-center flex-shrink-0
`;
