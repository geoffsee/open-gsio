import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import MessageEditor from '../MessageEditorComponent';

// Import the mocked clientChatStore
import clientChatStore from '../../../../stores/ClientChatStore';

// Mock the Message model
vi.mock('../../../../models/Message', () => {
  return {
    default: {
      // This is needed for the Instance<typeof Message> type
    }
  };
});

// Mock the ClientChatStore
vi.mock('../../../../stores/ClientChatStore', () => {
  const mockStore = {
    items: [],
    removeAfter: vi.fn(),
    sendMessage: vi.fn(),
    setIsLoading: vi.fn()
  };

  // Add the mockUserMessage to the items array
  mockStore.items.indexOf = vi.fn().mockReturnValue(0);

  return {
    default: mockStore
  };
});

describe('MessageEditor', () => {
  // Create a message object with a setContent method
  const mockUserMessage = { 
    content: 'Test message', 
    role: 'user',
    setContent: vi.fn()
  };
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with the message content', () => {
    render(<MessageEditor message={mockUserMessage} onCancel={mockOnCancel} />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue('Test message');
  });

  it('should update the content when typing', () => {
    render(<MessageEditor message={mockUserMessage} onCancel={mockOnCancel} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Updated message' } });

    expect(textarea).toHaveValue('Updated message');
  });

  it('should call setContent, removeAfter, sendMessage, and onCancel when save button is clicked', () => {
    render(<MessageEditor message={mockUserMessage} onCancel={mockOnCancel} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Updated message' } });

    const saveButton = screen.getByLabelText('Save edit');
    fireEvent.click(saveButton);

    expect(mockUserMessage.setContent).toHaveBeenCalledWith('Updated message');
    expect(clientChatStore.removeAfter).toHaveBeenCalledWith(0);
    expect(clientChatStore.sendMessage).toHaveBeenCalled();
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should call onCancel when cancel button is clicked', () => {
    render(<MessageEditor message={mockUserMessage} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByLabelText('Cancel edit');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
    expect(mockUserMessage.setContent).not.toHaveBeenCalled();
  });

  it('should save when Ctrl+Enter is pressed', () => {
    render(<MessageEditor message={mockUserMessage} onCancel={mockOnCancel} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Updated message' } });
    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });

    expect(mockUserMessage.setContent).toHaveBeenCalledWith('Updated message');
    expect(clientChatStore.removeAfter).toHaveBeenCalledWith(0);
    expect(clientChatStore.sendMessage).toHaveBeenCalled();
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should save when Meta+Enter is pressed', () => {
    render(<MessageEditor message={mockUserMessage} onCancel={mockOnCancel} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Updated message' } });
    fireEvent.keyDown(textarea, { key: 'Enter', metaKey: true });

    expect(mockUserMessage.setContent).toHaveBeenCalledWith('Updated message');
    expect(clientChatStore.removeAfter).toHaveBeenCalledWith(0);
    expect(clientChatStore.sendMessage).toHaveBeenCalled();
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should cancel when Escape is pressed', () => {
    render(<MessageEditor message={mockUserMessage} onCancel={mockOnCancel} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.keyDown(textarea, { key: 'Escape' });

    expect(mockOnCancel).toHaveBeenCalled();
    expect(mockUserMessage.setContent).not.toHaveBeenCalled();
  });
});
