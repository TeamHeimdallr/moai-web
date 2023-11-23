import tw, { css, styled } from 'twin.macro';

interface Props {
  tabs: {
    key: string;
    name: string;
    disabled?: boolean;
  }[];
  gap?: number;
  type?: 'large' | 'medium';
  onClick?: (name: string) => void;
  selectedTab?: string;
}

export const Tab = ({ tabs, gap = 24, type = 'medium', onClick, selectedTab }: Props) => {
  return (
    <Wrapper gap={gap}>
      {tabs.map(tab => {
        const handleClick = () => {
          if (tab.disabled) return;
          onClick?.(tab.key);
        };

        return (
          <Text
            key={tab.key}
            selected={tab.key === selectedTab}
            disabled={tab.disabled}
            onClick={handleClick}
            type={type}
          >
            {tab.name}
          </Text>
        );
      })}
    </Wrapper>
  );
};

interface DivProps {
  gap: number;
}
const Wrapper = styled.div<DivProps>(({ gap }) => [
  tw`
    flex overflow-scroll
  `,
  css`
    gap: ${gap}px;
  `,
]);

interface TextProps {
  selected?: boolean;
  type: string;
  disabled?: boolean;
}

const Text = styled.div<TextProps>(({ selected, type, disabled }) => [
  tw`clickable flex-shrink-0
  `,
  selected ? tw`text-primary-60` : tw`text-neutral-60 hover:text-primary-80`,
  type === 'large' ? tw`font-b-18` : tw`font-b-16`,
  disabled && tw`text-neutral-60 non-clickable hover:text-neutral-60`,
]);
