import Skeleton from 'react-loading-skeleton';
import tw from 'twin.macro';

export const ButtonSkeleton = () => {
  return (
    <Wrapper>
      <Skeleton
        height="100%"
        highlightColor="#3F4359"
        baseColor="#2B2E44"
        duration={0.9}
        style={{ borderRadius: 12 }}
      />
    </Wrapper>
  );
};

const Wrapper = tw.div`w-full h-48 rounded-12 bg-neutral-10`;
