import { describe, it, expect } from 'vitest';
import { agenticRAG, AgenticRAGTool } from '../agentic-rag-clean';

describe('Agentic RAG System', () => {
  it('should analyze queries correctly', async () => {
    // Test factual query
    const factualResult = await agenticRAG({
      action: 'analyze_query',
      query: 'What is artificial intelligence?',
    });

    expect(factualResult.status).toBe('success');
    expect(factualResult.needsRetrieval).toBe(true);
    expect(factualResult.data.queryType).toBe('factual');

    // Test conversational query
    const conversationalResult = await agenticRAG({
      action: 'analyze_query',
      query: 'Hello, how are you?',
    });

    expect(conversationalResult.status).toBe('success');
    expect(conversationalResult.needsRetrieval).toBe(false);
    expect(conversationalResult.data.queryType).toBe('conversational');

    // Test creative query
    const creativeResult = await agenticRAG({
      action: 'analyze_query',
      query: 'Write a story about a robot',
    });

    expect(creativeResult.status).toBe('success');
    expect(creativeResult.needsRetrieval).toBe(false);
    expect(creativeResult.data.queryType).toBe('creative');
  });

  it('should search knowledge base for factual queries', async () => {
    const result = await agenticRAG({
      action: 'search_knowledge',
      query: 'What is machine learning?',
      top_k: 2,
      threshold: 0.1,
    });

    expect(result.status).toBe('success');
    expect(result.needsRetrieval).toBe(true);
    expect(result.context).toBeDefined();
    expect(Array.isArray(result.context)).toBe(true);
    expect(result.data.retrieved_documents).toBeDefined();
  });

  it('should not search for conversational queries', async () => {
    const result = await agenticRAG({
      action: 'search_knowledge',
      query: 'Hello there!',
    });

    expect(result.status).toBe('success');
    expect(result.needsRetrieval).toBe(false);
    expect(result.data.retrieved_documents).toHaveLength(0);
  });

  it('should store documents successfully', async () => {
    const result = await agenticRAG({
      action: 'store_document',
      document: {
        id: 'test-doc-1',
        content: 'This is a test document about neural networks and deep learning.',
        metadata: { category: 'AI', author: 'Test Author' },
      },
    });

    expect(result.status).toBe('success');
    expect(result.data.document_id).toBe('test-doc-1');
    expect(result.data.content_length).toBeGreaterThan(0);
  });

  it('should get context for factual queries', async () => {
    const result = await agenticRAG({
      action: 'get_context',
      query: 'Tell me about vector databases',
      top_k: 2,
    });

    expect(result.status).toBe('success');
    expect(result.needsRetrieval).toBe(true);
    expect(result.context).toBeDefined();
    expect(result.data.context_summary).toBeDefined();
  });

  it('should handle errors gracefully', async () => {
    const result = await agenticRAG({
      action: 'analyze_query',
      // Missing query parameter
    });

    expect(result.status).toBe('error');
    expect(result.message).toContain('Query is required');
  });

  it('should have correct tool definition structure', () => {
    expect(AgenticRAGTool.type).toBe('function');
    expect(AgenticRAGTool.function.name).toBe('agentic_rag');
    expect(AgenticRAGTool.function.description).toBeDefined();
    expect(AgenticRAGTool.function.parameters.type).toBe('object');
    expect(AgenticRAGTool.function.parameters.properties.action).toBeDefined();
    expect(AgenticRAGTool.function.parameters.required).toContain('action');
  });

  it('should demonstrate intelligent retrieval decision making', async () => {
    // Test various query types to show intelligent decision making
    const queries = [
      { query: 'What is AI?', expectedRetrieval: true },
      { query: 'Hello world', expectedRetrieval: false },
      { query: 'Write a poem', expectedRetrieval: false },
      { query: 'Explain machine learning', expectedRetrieval: true },
      { query: 'How are you doing?', expectedRetrieval: false },
    ];

    for (const testCase of queries) {
      const result = await agenticRAG({
        action: 'search_knowledge',
        query: testCase.query,
      });

      expect(result.status).toBe('success');
      expect(result.needsRetrieval).toBe(testCase.expectedRetrieval);

      console.log(`[DEBUG_LOG] Query: "${testCase.query}" - Retrieval needed: ${result.needsRetrieval}`);
    }
  });
});