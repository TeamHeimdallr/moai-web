import tw, { css, styled } from 'twin.macro';

interface Props {
  tabs: {
    key: string;
    name: string;
  }[];
  gap?: number;
  type?: 'large' | 'medium';
  onClick?: (name: string) => void;
  selectedTab?: string;
}

export const Tab = ({ tabs, gap = 24, type = 'medium', onClick, selectedTab }: Props) => {
  return (
    <Wrapper gap={gap}>
      {tabs.map(tab => (
        <Text
          key={tab.key}
          selected={tab.key === selectedTab}
          onClick={() => onClick?.(tab.key)}
          type={type}
        >
          {tab.name}
        </Text>
      ))}
    </Wrapper>
  );
};

interface DivProps {
  gap: number;
}
const Wrapper = styled.div<DivProps>(({ gap }) => [
  tw`flex`,
  css`
    gap: ${gap}px;
  `,
]);

interface TextProps {
  selected?: boolean;
  type: string;
}

const Text = styled.div<TextProps>(({ selected, type }) => [
  tw`clickable`,
  selected ? tw`text-primary-60` : tw`text-neutral-60 hover:text-primary-80`,
  type === 'large' ? tw`font-b-18` : tw`font-b-16`,
]);
