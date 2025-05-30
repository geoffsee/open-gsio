// Vitest setup file
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock for framer-motion to avoid animation-related issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: (props: any) => React.createElement('div', props, props.children),
  },
  AnimatePresence: (props: any) => React.createElement(React.Fragment, null, props.children),
}));

// Mock for static data if needed
vi.mock('../static-data/welcome_home_text', () => ({
  welcome_home_text: 'Welcome home text mock',
  welcome_home_tip: 'Welcome home tip mock',
}));