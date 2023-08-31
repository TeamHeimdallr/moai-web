import { SVGProps } from 'react';

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'color'> {
  color?: string;
}

export const IconNoti = ({ color, ...rest }: IconProps) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      {...rest}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.5412 10.3647C18.5412 6.75208 15.6126 3.82349 12 3.82349C8.3874 3.82349 5.4588 6.75208 5.4588 10.3647V13.4373C5.4588 13.569 5.44579 13.7003 5.41996 13.8295L5.1196 15.3313C4.87208 16.5689 5.81866 17.7235 7.08076 17.7235H16.9192C18.1813 17.7235 19.1279 16.5689 18.8804 15.3313L18.58 13.8295C18.5542 13.7003 18.5412 13.569 18.5412 13.4373V10.3647ZM12 20.1765C10.932 20.1765 10.0234 19.4939 9.68662 18.5412H14.3134C13.9767 19.4939 13.068 20.1765 12 20.1765Z"
        fill={color ?? '#191F28'}
      />
    </svg>
  );
};

export const IconLink = ({ color, ...rest }: IconProps) => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      {...rest}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.6667 4.66675C15.0349 4.66675 15.3334 4.96522 15.3334 5.33341V13.3334C15.3334 13.7016 15.0349 14.0001 14.6667 14.0001C14.2985 14.0001 14.0001 13.7016 14.0001 13.3334L14.0001 6.64712L6.08094 14.5662C5.82059 14.8266 5.39848 14.8266 5.13813 14.5662C4.87778 14.3059 4.87778 13.8838 5.13813 13.6234L12.7615 6.00008H6.66673C6.29854 6.00008 6.00006 5.7016 6.00006 5.33341C6.00006 4.96523 6.29854 4.66675 6.66673 4.66675H14.6662L14.6667 4.66675Z"
        fill={color ?? '#9296AD'}
      />
    </svg>
  );
};

export const IconCopy = ({ color, ...rest }: IconProps) => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      {...rest}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.6667 4.66659H9.33333V5.99992H10.6667C11.403 5.99992 12 6.59687 12 7.33325V12.6666H14.6667V4.66659ZM12 13.9999V15.3333C12 16.0696 11.403 16.6666 10.6667 16.6666H5.33333C4.59695 16.6666 4 16.0696 4 15.3333V7.33325C4 6.59687 4.59695 5.99992 5.33333 5.99992H8V4.66659C8 3.93021 8.59695 3.33325 9.33333 3.33325H14.6667C15.403 3.33325 16 3.93021 16 4.66659V12.6666C16 13.403 15.403 13.9999 14.6667 13.9999H12ZM5.33333 15.3333L5.33333 7.33325H10.6667V15.3333H5.33333Z"
        fill={color ?? '#9296AD'}
      />
    </svg>
  );
};