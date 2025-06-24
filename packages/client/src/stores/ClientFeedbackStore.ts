import { types, flow } from 'mobx-state-tree';

const ClientFeedbackStore = types
  .model('ClientFeedbackStore', {
    input: types.optional(types.string, ''),
    isLoading: types.optional(types.boolean, false),
    isSubmitted: types.optional(types.boolean, false),
    error: types.optional(types.string, ''),
  })
  .actions(self => {
    const setError = error => {
      self.error = error;
    };

    const setInput = value => {
      self.input = value;

      if (self.error) {
        setError('');
      }
    };

    const reset = () => {
      self.input = '';
      self.isLoading = false;
      self.isSubmitted = false;
      self.error = '';
    };

    const validateInput = () => {
      if (!self.input.trim()) {
        setError('Feedback cannot be empty.');
        return false;
      }

      if (self.input.length > 500) {
        setError('Feedback cannot exceed 500 characters.');
        return false;
      }

      setError('');
      return true;
    };

    const submitFeedback = flow(function* () {
      if (!validateInput()) {
        return false;
      }

      self.isLoading = true;

      try {
        const response = yield fetch('/api/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ feedback: self.input }),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        self.isSubmitted = true;
        self.input = '';
        return true;
      } catch (error) {
        console.error(error);
        setError(error.message || 'An error occurred while submitting feedback.');
        return false;
      } finally {
        self.isLoading = false;
      }
    });

    return {
      setInput,
      setError,
      reset,
      validateInput,
      submitFeedback,
    };
  });

const feedbackStore = ClientFeedbackStore.create();

export default feedbackStore;
