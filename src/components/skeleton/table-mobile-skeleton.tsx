import { ReactNode } from 'react';
import Skeleton from 'react-loading-skeleton';
import tw, { styled } from 'twin.macro';

interface Props {
  columns: ReactNode;
  type?: 'darker' | 'lighter';
  skeletonHeight?: number;
}

export const TableMobileSkeleton = ({ columns, type, skeletonHeight = 510 }: Props) => {
  return (
    <Wrapper type={type}>
      <Header>{columns}</Header>
      <Divider type={type} />
      <Skeleton
        height={skeletonHeight}
        highlightColor="#2B2E44"
        baseColor="#23263A"
        duration={0.9}
        style={{ borderRadius: '0 0 12px 12px' }}
      />
    </Wrapper>
  );
};

interface WrapperProps {
  type?: 'darker' | 'lighter';
}
const Wrapper = styled.div<WrapperProps>(({ type }) => [
  tw`
    w-full flex flex-col bg-neutral-10 rounded-12 overflow-hidden
  `,
  type === 'lighter' && tw`bg-neutral-15`,
]);
const Header = tw.div`
  py-16 px-20 flex justify-end items-center
`;

interface DividerProps {
  type?: 'darker' | 'lighter';
}
const Divider = styled.div<DividerProps>(({ type }) => [
  tw`w-full h-1 flex-shrink-0 bg-neutral-15`,
  type === 'lighter' && tw`bg-neutral-20`,
]);
