import { describe, it, expect, beforeEach } from 'vitest';

import menuState from '../AppMenuStore';

describe('AppMenuStore', () => {
  beforeEach(() => {
    // Reset the menu state before each test
    menuState.closeMenu();
  });

  it('should have isOpen set to false initially', () => {
    // Reset to initial state
    menuState.closeMenu();
    expect(menuState.isOpen).toBe(false);
  });

  it('should set isOpen to true when openMenu is called', () => {
    menuState.openMenu();
    expect(menuState.isOpen).toBe(true);
  });

  it('should set isOpen to false when closeMenu is called', () => {
    // First open the menu
    menuState.openMenu();
    expect(menuState.isOpen).toBe(true);

    // Then close it
    menuState.closeMenu();
    expect(menuState.isOpen).toBe(false);
  });

  it('should toggle isOpen when toggleMenu is called', () => {
    // Initially isOpen should be false (from beforeEach)
    expect(menuState.isOpen).toBe(false);

    // First toggle - should set to true
    menuState.toggleMenu();
    expect(menuState.isOpen).toBe(true);

    // Second toggle - should set back to false
    menuState.toggleMenu();
    expect(menuState.isOpen).toBe(false);
  });
});
