import {
  cssTransition,
  ToastContainer as ToastifyToastContainer,
  ToastContainerProps,
} from 'react-toastify';
import { css, styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';

interface Props extends ToastContainerProps {}

export const ToastContainer = ({ ...rest }: Props) => {
  const slide = cssTransition({
    enter: 'slide-in-right',
    exit: 'slide-out-right ',
  });

  return (
    <Wrapper>
      <ToastifyToastContainer
        autoClose={15000}
        pauseOnFocusLoss={true}
        transition={slide}
        theme="dark"
        closeButton={false}
        draggable={false}
        {...rest}
      />
    </Wrapper>
  );
};

const Wrapper = styled.div(() => [
  css`
    /** Used to define container behavior: width, position: fixed etc... **/

    .Toastify__toast-container {
      width: 334px;
      animation-duration: 0.2s;
    }

    /** Used to define the position of the ToastContainer **/
    .Toastify__toast-container--top-left {
    }
    .Toastify__toast-container--top-center {
    }
    .Toastify__toast-container--top-right {
      top: 0px;
      right: 0px;

      padding: 20px;
    }
    .Toastify__toast-container--bottom-left {
    }
    .Toastify__toast-container--bottom-center {
    }
    .Toastify__toast-container--bottom-right {
    }

    /** Classes for the displayed toast **/
    .Toastify__toast {
      padding: 8px 8px 16px 16px;
      border-radius: 8px;

      background-color: ${COLOR.NEUTRAL[15]};
      box-shadow: 0px 4px 24px 0px rgba(25, 27, 40, 0.6);
    }
    .Toastify__toast--rtl {
    }
    .Toastify__toast-body {
      margin: 0;
      padding: 0;
    }

    /** Used to position the icon **/
    .Toastify__toast-icon {
    }

    /** handle the notification color and the text color based on the theme **/
    .Toastify__toast-theme--dark {
    }
    .Toastify__toast-theme--light {
    }
    .Toastify__toast-theme--colored.Toastify__toast--default {
    }
    .Toastify__toast-theme--colored.Toastify__toast--info {
    }
    .Toastify__toast-theme--colored.Toastify__toast--success {
    }
    .Toastify__toast-theme--colored.Toastify__toast--warning {
    }
    .Toastify__toast-theme--colored.Toastify__toast--error {
    }

    .Toastify__progress-bar {
    }
    .Toastify__progress-bar--rtl {
    }
    .Toastify__progress-bar-theme--light {
    }
    .Toastify__progress-bar-theme--dark {
    }
    .Toastify__progress-bar--info {
      background-color: ${COLOR.ORANGE[50]};
    }
    .Toastify__progress-bar--success {
      background-color: ${COLOR.GREEN[50]};
    }
    .Toastify__progress-bar--warning {
    }
    .Toastify__progress-bar--error {
      background-color: ${COLOR.RED[50]};
    }
    /** colored notifications share the same progress bar color **/
    .Toastify__progress-bar-theme--colored.Toastify__progress-bar--info,
    .Toastify__progress-bar-theme--colored.Toastify__progress-bar--success,
    .Toastify__progress-bar-theme--colored.Toastify__progress-bar--warning,
    .Toastify__progress-bar-theme--colored.Toastify__progress-bar--error {
    }

    /** Classes for the close button. Better use your own closeButton **/
    .Toastify__close-button {
    }
    .Toastify__close-button--default {
    }
    .Toastify__close-button > svg {
    }
    .Toastify__close-button:hover,
    .Toastify__close-button:focus {
    }
  `,
  css`
    .slide-in-right {
      -webkit-animation: slide-in-right 0.3s ease-in-out both;
      animation: slide-in-right 0.3s ease-in-out both;
    }
    .slide-out-right {
      -webkit-animation: slide-out-right 0.3s ease-in-out both;
      animation: slide-out-right 0.3s ease-in-out both;
    }

    @-webkit-keyframes slide-in-right {
      0% {
        -webkit-transform: translateX(1000px);
        transform: translateX(1000px);
        opacity: 0;
      }
      100% {
        -webkit-transform: translateX(0);
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slide-in-right {
      0% {
        -webkit-transform: translateX(1000px);
        transform: translateX(1000px);
        opacity: 0;
      }
      100% {
        -webkit-transform: translateX(0);
        transform: translateX(0);
        opacity: 1;
      }
    }

    @-webkit-keyframes slide-out-right {
      0% {
        -webkit-transform: translateX(0);
        transform: translateX(0);
        opacity: 1;
      }
      100% {
        -webkit-transform: translateX(1000px);
        transform: translateX(1000px);
        opacity: 0;
      }
    }
    @keyframes slide-out-right {
      0% {
        -webkit-transform: translateX(0);
        transform: translateX(0);
        opacity: 1;
      }
      100% {
        -webkit-transform: translateX(1000px);
        transform: translateX(1000px);
        opacity: 0;
      }
    }
  `,
]);
