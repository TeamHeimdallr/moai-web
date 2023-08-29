import { SVGProps } from 'react';

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'color'> {
  color?: string;
}

export const IconLogoText = ({ color, ...rest }: IconProps) => (
  <svg
    width="339"
    height="83"
    viewBox="0 0 339 83"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
    {...rest}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M164.96 0C140.3 0 125.91 19.58 125.91 40.78C125.91 64.58 142.57 82.21 167.34 82.21C192.11 82.21 206.28 62.63 206.28 41.43C206.28 17.74 189.62 0 164.96 0ZM150.04 6.06C165.51 6.06 189.52 43.7 189.52 66.96C189.52 73.23 186.92 76.15 182.16 76.15C167.24 76.15 142.79 38.51 142.79 15.25C142.79 9.2 145.71 6.06 150.04 6.06ZM39.9 3.60999L57.83 52.51L75.6 3.60999H115.5V78.61H91V25.97L70.5 78.61H45L24.5 26.22V78.61H0V3.60999H39.9ZM205.5 78.61L238.4 3.60999H272.8L305.7 78.61H278.2L273.07 66.01H238.13L233 78.61H205.5ZM255.6 23.11L246.48 45.51H264.72L255.6 23.11ZM338.2 3.60999H312.4V78.61H338.2V3.60999Z"
      fill={color ?? '#F8FFA7'}
    />
  </svg>
);
