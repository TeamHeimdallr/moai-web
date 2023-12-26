import Skeleton, { SkeletonProps } from 'react-loading-skeleton';

interface SkeletonBaseProps extends SkeletonProps {
  width?: string | number;
  height?: number;
  type?: 'dark' | 'light';
}
export const SkeletonBase = ({ width, height, type, ...rest }: SkeletonBaseProps) => {
  return (
    <Skeleton
      width={width || '100%'}
      height={height}
      baseColor={type === 'dark' ? '#23263A' : '#2B2E44'}
      highlightColor={type === 'dark' ? '#2B2E44' : '#3F4359'}
      duration={0.9}
      {...rest}
    />
  );
};
