import { extendTheme } from '@chakra-ui/react';

import BaseTheme from '../base_theme';

import CapuchinColors from './Capuchin';
import DarknightColors from './Darknight';
import OneDark from './OneDark';
import VsCodeColors from './VsCode';

export function getColorThemes() {
  return [
    { name: 'darknight', colors: DarknightColors },
    { name: 'onedark', colors: OneDark },
    { name: 'capuchin', colors: CapuchinColors },
    { name: 'vscode', colors: VsCodeColors },
  ];
}

const darknight = extendTheme({
  ...BaseTheme,
  colors: DarknightColors,
});

const capuchin = extendTheme({
  ...BaseTheme,
  colors: CapuchinColors,
});

const vsCode = extendTheme({
  ...BaseTheme,
  colors: VsCodeColors,
});

const onedark = extendTheme({
  ...BaseTheme,
  colors: OneDark,
});

export function getTheme(theme: string) {
  switch (theme) {
    case 'onedark':
      return onedark;
    case 'darknight':
      return darknight;
    case 'capuchin':
      return capuchin;
    case 'vscode':
      return vsCode;
    default:
      return darknight;
  }
}
