// Vitest setup file
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock for framer-motion to avoid animation-related issues in tests
// vi.mock('framer-motion', () => ({
//   motion: (Component: React.ElementType) => (props: any) => React.createElement(Component, props, props.children), // Changed this line
//   AnimatePresence: (props: any) => React.createElement(React.Fragment, null, props.children),
// }));

// Mock for static data if needed
vi.mock('../static-data/welcome_home_text', () => ({
  welcome_home_text: 'Welcome home text mock',
  welcome_home_tip: 'Welcome home tip mock',
}));