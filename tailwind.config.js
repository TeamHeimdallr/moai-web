const defaultTheme = require('tailwindcss/defaultTheme');
const plugin = require('tailwindcss/plugin');

const spacing = [...Array(2001).keys()];
const convertSpacing = (spacing, withoutPx) =>
  spacing.reduce((res, space) => {
    res[space] = withoutPx ? `${space}` : `${space}px`;
    return res;
  }, {});

const ASSET_URL = 'https://assets.moai-finance.xyz';

module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    screens: {
      xs: '0px',
      sm: '360px',
      md: '820px',
      lg: '1120px',
      xl: '1320px',
      xxl: '1440px',
    },

    extend: {
      colors: {
        primary: {
          20: '#51565D',
          50: '#F5FF83',
          60: '#F8FFA7',
          80: '#FCFFD6',
        },
        red: {
          50: '#FF685F',
        },
        green: {
          50: '#43CF9D',
        },
        neutral: {
          0: '#191B28',
          5: '#1C2033',
          10: '#23263A',
          15: '#2B2E44',
          20: '#3F4359',
          30: '#545873',
          40: '#6D728C',
          60: '#9296AD',
          70: '#ABB0C5',
          80: '#CCCFDC',
          85: '#DCDEE7',
          90: '#ECEEF5',
          95: '#F7F7FB',
          100: '#FFFFFF',
        },
        orange: {
          50: '#FF9B63',
        },
      },

      fontFamily: {
        sans: ['Pretendard Variable', '-apple-system', 'Helvetica', 'Arial', 'sans-serif'],
      },

      fontSize: {
        ...convertSpacing([...Array(101).keys()]),
      },

      fontWeight: {
        100: 100,
        200: 200,
        300: 300,
        400: 400,
        500: 500,
        600: 600,
        700: 700,
        800: 800,
        900: 900,
      },

      spacing: {
        ...defaultTheme.spacing,
        ...convertSpacing(spacing),
      },

      width: theme => ({ ...defaultTheme.width, ...theme('spacing') }),
      height: theme => ({ ...defaultTheme.height, ...theme('spacing') }),

      minWidth: theme => ({ ...defaultTheme.minWidth, ...theme('spacing') }),
      maxWidth: theme => ({ ...defaultTheme.maxWidth, ...theme('spacing') }),

      minHeight: theme => ({ ...defaultTheme.minHeight, ...theme('spacing') }),
      maxHeight: theme => ({ ...defaultTheme.maxHeight, ...theme('spacing') }),

      lineHeight: theme => ({
        ...defaultTheme.lineHeight,
        ...convertSpacing([...Array(101).keys()]),
      }),

      borderRadius: theme => ({
        ...defaultTheme.lineHeight,
        ...convertSpacing([...Array(101).keys()]),
      }),
      borderWidth: theme => ({
        ...defaultTheme.borderWidth,
        ...convertSpacing([...Array(21).keys()]),
      }),

      boxShadow: theme => ({
        ...defaultTheme.boxShadow,
      }),

      zIndex: theme => ({
        ...defaultTheme.zIndex,
        ...convertSpacing([...Array(101).keys()], true),
      }),

      backgroundImage: {
        landing: `url('${ASSET_URL}/images/bg-landing.png')`,
        campaign: `url('${ASSET_URL}/images/bg-campaign.png')`,
      },
    },
  },
  truncate: {
    lines: { 2: '2', 3: '3', 4: '4' },
  },
  variants: {
    extend: {
      backgroundColor: ['disabled', 'active'],
      borderColor: ['disabled', 'active'],
      textColor: ['disabled', 'active'],
    },
  },
  plugins: [
    plugin(function ({ addBase, addComponents, addUtilities, theme }) {
      addBase({
        '.font-r-11': {
          fontFamily: 'Pretendard Variable',
          fontSize: '11px',
          fontWeight: 400,
          lineHeight: '18px',
        },

        '.font-r-12': {
          fontFamily: 'Pretendard Variable',
          fontSize: '12px',
          fontWeight: 400,
          lineHeight: '20px',
        },

        '.font-r-14': {
          fontFamily: 'Pretendard Variable',
          fontSize: '14px',
          fontWeight: 400,
          lineHeight: '22px',
        },

        '.font-r-16': {
          fontFamily: 'Pretendard Variable',
          fontSize: '16px',
          fontWeight: 400,
          lineHeight: '24px',
        },

        '.font-r-18': {
          fontFamily: 'Pretendard Variable',
          fontSize: '18px',
          fontWeight: 400,
          lineHeight: '26px',
        },

        '.font-m-12': {
          fontFamily: 'Pretendard Variable',
          fontSize: '12px',
          fontWeight: 500,
          lineHeight: '20px',
        },
        '.font-m-14': {
          fontFamily: 'Pretendard Variable',
          fontSize: '14px',
          fontWeight: 500,
          lineHeight: '22px',
        },
        '.font-m-16': {
          fontFamily: 'Pretendard Variable',
          fontSize: '16px',
          fontWeight: 500,
          lineHeight: '24px',
        },
        '.font-m-18': {
          fontFamily: 'Pretendard Variable',
          fontSize: '18px',
          fontWeight: 500,
          lineHeight: '26px',
        },
        '.font-m-20': {
          fontFamily: 'Pretendard Variable',
          fontSize: '20px',
          fontWeight: 500,
          lineHeight: '28px',
          letterSpacing: '-0.5px',
        },

        '.font-m-24': {
          fontFamily: 'Pretendard Variable',
          fontSize: '24px',
          fontWeight: 500,
          lineHeight: '32px',
          letterSpacing: '-0.5px',
        },

        '.font-b-11': {
          fontFamily: 'Pretendard Variable',
          fontSize: '11px',
          fontWeight: 700,
          lineHeight: '18px',
        },
        '.font-b-12': {
          fontFamily: 'Pretendard Variable',
          fontSize: '12px',
          fontWeight: 700,
          lineHeight: '20px',
        },

        '.font-b-14': {
          fontFamily: 'Pretendard Variable',
          fontSize: '14px',
          fontWeight: 700,
          lineHeight: '22px',
        },

        '.font-b-16': {
          fontFamily: 'Pretendard Variable',
          fontSize: '16px',
          fontWeight: 700,
          lineHeight: '24px',
        },

        '.font-b-18': {
          fontFamily: 'Pretendard Variable',
          fontSize: '18px',
          fontWeight: 700,
          lineHeight: '26px',
        },

        '.font-b-20': {
          fontFamily: 'Pretendard Variable',
          fontSize: '20px',
          fontWeight: 700,
          lineHeight: '28px',
        },

        '.font-b-24': {
          fontFamily: 'Pretendard Variable',
          fontSize: '24px',
          fontWeight: 700,
          lineHeight: '32px',
        },

        '.font-b-28': {
          fontFamily: 'Pretendard Variable',
          fontSize: '28px',
          fontWeight: 700,
          lineHeight: '38px',
        },

        '.font-b-36': {
          fontFamily: 'Pretendard Variable',
          fontSize: '36px',
          fontWeight: 700,
          lineHeight: '44px',
        },

        '.font-b-48': {
          fontFamily: 'Pretendard Variable',
          fontSize: '48px',
          fontWeight: 700,
          lineHeight: '60px',
          letterSpacing: '-1px',
        },
        '.font-eb-32': {
          fontFamily: 'Pretendard Variable',
          fontSize: '32px',
          fontWeight: 800,
          lineHeight: '36px',
        },
        '.font-eb-60': {
          fontFamily: 'Pretendard Variable',
          fontSize: '60px',
          fontWeight: 800,
          lineHeight: '72px',
          letterSpacing: '-1px',
        },
        '.font-eb-80': {
          fontFamily: 'Pretendard Variable',
          fontSize: '80px',
          fontWeight: 800,
          lineHeight: '84px',
          letterSpacing: '-1px',
        },
      });
      addComponents({});

      addUtilities({
        '.inline-flex-center': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        '.flex-center': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        '.absolute-center': {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        },
        '.absolute-center-x': {
          left: '50%',
          transform: 'translateX(-50%)',
        },
        '.absolute-center-y': {
          top: '50%',
          transform: 'translateY(-50%)',
        },

        '.clickable': {
          cursor: 'pointer',
        },
        '.non-clickable': {
          cursor: 'not-allowed',
          userSelect: 'none',
        },

        '.transition-color': {
          transitionProperty: 'background-color,border-color,color,fill,stroke',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
          transitionDuration: '150ms',
        },
        '.transition-toggle': {
          transitionProperty: 'width,height,left,right,top',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
          transitionDuration: '150ms',
        },
        '.transition-transform': {
          transitionProperty: 'transform',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
          transitionDuration: '150ms',
        },

        '.address': {
          fontVariantLigatures: 'no-contextual',
        },

        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },

        '.drop-shadow-default': {
          filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.10))',
        },

        '.box-shadow-default': {
          boxShadow: '0px 4px 24px 0px rgba(25, 27, 40, 0.6)',
        },

        '.gradient-chip': {
          background:
            'linear-gradient(0deg, #51565D, #51565D), linear-gradient(0deg, #F5FF83, #F5FF83)',
        },
        '.pop-up-shadow': {
          'box-shadow': '0px 8px 60px 0px rgba(0, 0, 0, 0.60)',
        },
        '.svg-shadow': {
          'box-shadow': '0px 4px 16px 0px rgba(28, 32, 51, 0.40)',
        },
      });
    }),
  ],
};
