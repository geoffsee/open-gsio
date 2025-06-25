import { extendTheme } from '@chakra-ui/react';

const fonts = {
  body: 'monospace',
  heading: 'monospace',
};

const styles = {
  global: {
    body: {
      fontFamily: fonts.body,
      bg: 'background.primary',
      color: 'text.primary',
      margin: 0,
      overflow: 'hidden',
    },
    html: {
      overflow: 'hidden',
    },
    '::selection': {
      backgroundColor: 'accent.secondary',
      color: 'background.primary',
    },
  },
};

const components = {
  Button: {
    baseStyle: {
      fontWeight: 'bold',
      borderRadius: 'md', // Slightly rounded corners
    },
    variants: {
      solid: {
        bg: 'accent.primary',
        color: 'background.primary',
        _hover: {
          bg: 'accent.primary',
          color: 'background.primary',
        },
      },
      outline: {
        borderColor: 'accent.primary',
        color: 'text.primary',
        _hover: {
          bg: 'accent.primary',
          color: 'background.primary',
        },
      },
      ghost: {
        color: 'text.primary',
        _hover: {
          bg: 'background.secondary',
        },
      },
    },
  },
  Link: {
    baseStyle: {
      color: 'accent.secondary',
      _hover: {
        color: 'accent.primary',
        textDecoration: 'none',
      },
    },
  },
  Heading: {
    baseStyle: {
      color: 'text.primary',
      letterSpacing: 'tight',
    },
    sizes: {
      '4xl': { fontSize: ['6xl', null, '7xl'], lineHeight: 1 },
      '3xl': { fontSize: ['5xl', null, '6xl'], lineHeight: 1.2 },
      '2xl': { fontSize: ['4xl', null, '5xl'] },
      xl: { fontSize: ['3xl', null, '4xl'] },
      lg: { fontSize: ['2xl', null, '3xl'] },
      md: { fontSize: 'xl' },
      sm: { fontSize: 'md' },
      xs: { fontSize: 'sm' },
    },
  },
  Text: {
    baseStyle: {
      color: 'text.primary',
    },
    variants: {
      secondary: {
        color: 'text.secondary',
      },
      accent: {
        color: 'text.accent',
      },
    },
  },
  Input: {
    variants: {
      filled: {
        field: {
          bg: 'background.secondary',
          _hover: {
            bg: 'background.tertiary',
          },
          _focus: {
            bg: 'background.tertiary',
            borderColor: 'accent.primary',
          },
        },
      },
    },
  },
  CodeBlocks: {
    baseStyle: props => ({
      bg: 'background.primary',
      // color: 'text.primary',
    }),
  },
};

const Base_theme = extendTheme({
  config: {
    cssVarPrefix: 'wgs',
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  fonts,
  styles,
  components,
  letterSpacings: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
  space: {
    px: '1px',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    18: '4.5rem',
    20: '5rem',
    22: '5.5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
    34: '8.5rem',
    36: '9rem',
    38: '9.5rem',
    40: '10rem',
    44: '11rem',
    48: '12rem',
    52: '13rem',
    56: '14rem',
    60: '15rem',
    64: '16rem',
    72: '18rem',
    80: '20rem',
    96: '24rem',
  },
});

export default Base_theme;
