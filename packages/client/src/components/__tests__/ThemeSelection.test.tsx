import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import userOptionsStore from '../../stores/UserOptionsStore';
import * as MobileContext from '../contexts/MobileContext';
import { ThemeSelectionOptions } from '../ThemeSelection';

// Mock dependencies
vi.mock('../../layout/theme/color-themes', () => ({
  getColorThemes: () => [
    {
      name: 'light',
      colors: {
        background: { primary: '#ffffff', secondary: '#f0f0f0' },
        text: { secondary: '#333333' },
      },
    },
    {
      name: 'dark',
      colors: {
        background: { primary: '#121212', secondary: '#1e1e1e' },
        text: { secondary: '#e0e0e0' },
      },
    },
  ],
}));

vi.mock('../../stores/UserOptionsStore', () => ({
  default: {
    selectTheme: vi.fn(),
  },
}));

vi.mock('../toolbar/Toolbar', () => ({
  toolbarButtonZIndex: 100,
}));

describe('ThemeSelectionOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders theme options for desktop view', () => {
    // Mock useIsMobile to return false (desktop view)
    vi.spyOn(MobileContext, 'useIsMobile').mockReturnValue(false);

    render(<ThemeSelectionOptions />);

    // Should render 2 theme buttons (from our mock)
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
  });

  it('renders theme options for mobile view', () => {
    // Mock useIsMobile to return true (mobile view)
    vi.spyOn(MobileContext, 'useIsMobile').mockReturnValue(true);

    render(<ThemeSelectionOptions />);

    // Should still render 2 theme buttons
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
  });

  it('calls selectTheme when a theme button is clicked', () => {
    vi.spyOn(MobileContext, 'useIsMobile').mockReturnValue(false);

    render(<ThemeSelectionOptions />);

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]); // Click the first theme button (light)

    // Verify that selectTheme was called with the correct theme name
    expect(userOptionsStore.selectTheme).toHaveBeenCalledWith('light');

    fireEvent.click(buttons[1]); // Click the second theme button (dark)
    expect(userOptionsStore.selectTheme).toHaveBeenCalledWith('dark');
  });
});
