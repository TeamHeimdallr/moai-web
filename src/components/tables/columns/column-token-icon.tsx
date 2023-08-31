import { HTMLAttributes } from 'react';
import tw, { css, styled } from 'twin.macro';

import { TOKEN_IMAGE_MAPPER } from '~/constants';
import { TOKEN } from '~/types/contracts';

interface Props extends HTMLAttributes<HTMLDivElement> {
  tokens: TOKEN[];

  width?: number | 'full';
}
export const TableColumnTokenIcon = ({ tokens, width, ...rest }: Props) => {
  return (
    <Wrapper width={width} {...rest}>
      {tokens.map((token, idx) => (
        <Asset
          key={token}
          title={token as string}
          src={TOKEN_IMAGE_MAPPER[token]}
          idx={idx}
          total={tokens.length}
        />
      ))}
    </Wrapper>
  );
};

interface WrapperProps {
  width?: number | 'full';
}
const Wrapper = styled.div<WrapperProps>(({ width }) => [
  tw`relative flex-shrink-0 w-120 min-h-32`,
  width === 'full' && tw`flex-1 w-full`,
  typeof width === 'number' &&
    css`
      width: ${width}px;
    `,
]);

interface AssetProps {
  idx: number;
  total: number;
}
const Asset = styled.img<AssetProps>(({ idx, total }) => [
  tw`absolute flex w-24 h-24 border-solid rounded-full border-1 border-neutral-0 top-4`,
  css`
    z-index: ${total - idx};
    left: ${idx * 20}px;
  `,
]);
