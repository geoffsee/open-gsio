import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import messageEditorStore from '../../../../stores/MessageEditorStore';
import MessageBubble from '../MessageBubble';

// Mock browser APIs
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Add ResizeObserver to the global object
global.ResizeObserver = MockResizeObserver;

// Mock the Message model
vi.mock('../../../../models/Message', () => ({
  default: {
    // This is needed for the Instance<typeof Message> type
  },
}));

// Mock the stores
vi.mock('../../../../stores/ClientChatStore', () => ({
  default: {
    items: [],
    isLoading: false,
    editMessage: vi.fn().mockReturnValue(true),
  },
}));

vi.mock('../../../../stores/UserOptionsStore', () => ({
  default: {
    followModeEnabled: false,
    setFollowModeEnabled: vi.fn(),
  },
}));

// Mock the MessageEditorStore
vi.mock('../../../../stores/MessageEditorStore', () => ({
  default: {
    editedContent: 'Test message',
    setEditedContent: vi.fn(),
    setMessage: vi.fn(),
    onCancel: vi.fn(),
    handleSave: vi.fn().mockImplementation(function () {
      // Use the mocked messageEditorStore from the import
      messageEditorStore.onCancel();
      return Promise.resolve();
    }),
  },
}));

// Mock the MessageRenderer component
vi.mock('../ChatMessageContent', () => ({
  default: ({ content }) => <div data-testid="message-content">{content}</div>,
}));

// Mock the UserMessageTools component
vi.mock('../UserMessageTools', () => ({
  default: ({ message, onEdit }) => (
    <button data-testid="edit-button" onClick={() => onEdit(message)}>
      Edit
    </button>
  ),
}));

vi.mock('../MotionBox', async importOriginal => {
  const actual = await importOriginal();

  return {
    default: {
      ...actual.default,
      div: (props: any) => React.createElement('div', props, props.children),
      motion: (props: any) => React.createElement('div', props, props.children),
    },
  };
});

describe('MessageBubble', () => {
  const mockScrollRef = { current: { scrollTo: vi.fn() } };
  const mockUserMessage = {
    role: 'user',
    content: 'Test message',
  };
  const mockAssistantMessage = {
    role: 'assistant',
    content: 'Assistant response',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render user message correctly', () => {
    render(<MessageBubble msg={mockUserMessage} scrollRef={mockScrollRef} />);

    expect(screen.getByText('You')).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('should render assistant message correctly', () => {
    render(<MessageBubble msg={mockAssistantMessage} scrollRef={mockScrollRef} />);

    expect(screen.getByText('yachtpit-ai')).toBeInTheDocument();
    expect(screen.getByTestId('message-content')).toHaveTextContent('Assistant response');
  });

  it('should show edit button on hover for user messages', async () => {
    render(<MessageBubble msg={mockUserMessage} scrollRef={mockScrollRef} />);

    // Simulate hover
    fireEvent.mouseEnter(screen.getByRole('listitem'));

    expect(screen.getByTestId('edit-button')).toBeInTheDocument();
  });

  it('should show editor when edit button is clicked', () => {
    render(<MessageBubble msg={mockUserMessage} scrollRef={mockScrollRef} />);

    // Simulate hover and click edit
    fireEvent.mouseEnter(screen.getByRole('listitem'));
    fireEvent.click(screen.getByTestId('edit-button'));

    // Check if the textarea is rendered (part of MessageEditor)
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should hide editor after message is edited and saved', async () => {
    render(<MessageBubble msg={mockUserMessage} scrollRef={mockScrollRef} />);

    // Show the editor
    fireEvent.mouseEnter(screen.getByRole('listitem'));
    fireEvent.click(screen.getByTestId('edit-button'));

    // Verify editor is shown
    expect(screen.getByRole('textbox')).toBeInTheDocument();

    // Find and click the save button
    const saveButton = screen.getByLabelText('Save edit');
    fireEvent.click(saveButton);

    // Wait for the editor to disappear
    await waitFor(() => {
      // Check that the editor is no longer visible
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      // And the message content is visible again
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    // Verify that handleSave was called
    expect(messageEditorStore.handleSave).toHaveBeenCalled();
  });
});
