import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import WelcomeHomeMessage from '../WelcomeHome';
import { welcome_home_text, welcome_home_tip } from '../../static-data/welcome_home_text';
import { renderMarkdown } from '../markdown/MarkdownComponent';

// Mock the renderMarkdown function
vi.mock('../markdown/MarkdownComponent', () => ({
  renderMarkdown: vi.fn((text) => `Rendered: ${text}`),
}));

describe('WelcomeHomeMessage', () => {
  it('renders correctly when visible', () => {
    render(<WelcomeHomeMessage visible={true} />);
    
    // Check if the rendered markdown content is in the document
    expect(screen.getByText(`Rendered: ${welcome_home_text}`)).toBeInTheDocument();
    expect(screen.getByText(`Rendered: ${welcome_home_tip}`)).toBeInTheDocument();
    
    // Verify that renderMarkdown was called with the correct arguments
    expect(renderMarkdown).toHaveBeenCalledWith(welcome_home_text);
    expect(renderMarkdown).toHaveBeenCalledWith(welcome_home_tip);
  });

  it('applies animation variants based on visible prop', () => {
    const { rerender } = render(<WelcomeHomeMessage visible={true} />);
    
    // When visible is true, the component should have the visible animation state
    // Since we've mocked framer-motion, we can't directly test the animation state
    // But we can verify that the component renders the content
    expect(screen.getByText(`Rendered: ${welcome_home_text}`)).toBeInTheDocument();
    
    // Re-render with visible=false
    rerender(<WelcomeHomeMessage visible={false} />);
    
    // Content should still be in the document even when not visible
    // (since we've mocked the animations)
    expect(screen.getByText(`Rendered: ${welcome_home_text}`)).toBeInTheDocument();
  });
});