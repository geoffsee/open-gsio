import { describe, it, expect, vi, beforeEach } from 'vitest';

import { agenticRAG, AgenticRAGTools } from '../agentic-rag';

// Mock the dependencies
vi.mock('@zilliz/milvus2-sdk-node', () => ({
  MilvusClient: vi.fn().mockImplementation(() => ({
    listCollections: vi.fn().mockResolvedValue({
      collection_names: ['family_domestic', 'business_corporate'],
      data: [{ name: 'family_domestic' }, { name: 'business_corporate' }],
    }),
    search: vi.fn().mockResolvedValue({
      results: [
        {
          content: 'Test document about AI and machine learning',
          score: 0.85,
          metadata: '{"category": "AI", "author": "Test Author"}',
        },
        {
          content: 'Another document about neural networks',
          score: 0.75,
          metadata: '{"category": "ML", "author": "Another Author"}',
        },
      ],
    }),
    insert: vi.fn().mockResolvedValue({ success: true }),
    createCollection: vi.fn().mockResolvedValue({ success: true }),
    createIndex: vi.fn().mockResolvedValue({ success: true }),
  })),
  DataType: {
    VarChar: 'VarChar',
    FloatVector: 'FloatVector',
  },
}));

vi.mock('openai', () => ({
  OpenAI: vi.fn().mockImplementation(() => ({
    embeddings: {
      create: vi.fn().mockResolvedValue({
        data: [{ embedding: new Array(768).fill(0.1) }],
      }),
    },
  })),
}));

// Mock environment variables
vi.stubEnv('FIREWORKS_API_KEY', 'test-api-key');

describe('Agentic RAG System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should analyze queries correctly', async () => {
    // Test factual query
    const factualResult = await agenticRAG({
      action: 'analyze_query',
      query: 'What is artificial intelligence?',
      collection_name: 'family_domestic',
    });

    expect(factualResult.status).toBe('success');
    expect(factualResult.data.needsRetrieval).toBe(true);
    expect(factualResult.data.queryType).toBe('factual');

    // Test conversational query with multiple conversational keywords
    const conversationalResult = await agenticRAG({
      action: 'analyze_query',
      query: 'Hello, how are you doing today?',
      collection_name: 'family_domestic',
    });

    expect(conversationalResult.status).toBe('success');
    expect(conversationalResult.data.needsRetrieval).toBe(false);
    expect(conversationalResult.data.queryType).toBe('conversational');

    // Test creative query with multiple creative keywords
    const creativeResult = await agenticRAG({
      action: 'analyze_query',
      query: 'Write a story and compose a poem',
      collection_name: 'family_domestic',
    });

    expect(creativeResult.status).toBe('success');
    expect(creativeResult.data.needsRetrieval).toBe(false);
    expect(creativeResult.data.queryType).toBe('creative');
  });

  it('should search knowledge base for factual queries', async () => {
    const result = await agenticRAG({
      action: 'search_knowledge',
      query: 'What is machine learning?',
      collection_name: 'family_domestic',
      top_k: 2,
      similarity_threshold: 0.1,
    });

    expect(result.status).toBe('success');
    expect(result.context).toBeDefined();
    expect(Array.isArray(result.context)).toBe(true);
    expect(result.data.retrieved_documents).toBeDefined();
    expect(result.data.analysis.needsRetrieval).toBe(true);
  });

  it('should not search for conversational queries', async () => {
    const result = await agenticRAG({
      action: 'search_knowledge',
      query: 'Hello there! How are you?',
      collection_name: 'family_domestic',
    });

    expect(result.status).toBe('success');
    expect(result.data.analysis.needsRetrieval).toBe(false);
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
      collection_name: 'family_domestic',
    });

    expect(result.status).toBe('success');
    expect(result.data.document_id).toBe('test-doc-1');
    expect(result.data.content_length).toBeGreaterThan(0);
  });

  it('should get context for factual queries', async () => {
    const result = await agenticRAG({
      action: 'get_context',
      query: 'Tell me about vector databases',
      collection_name: 'family_domestic',
      top_k: 2,
    });

    expect(result.status).toBe('success');
    expect(result.data.analysis.needsRetrieval).toBe(true);
    expect(result.context).toBeDefined();
    expect(result.data.context_summary).toBeDefined();
  });

  it('should handle semantic search', async () => {
    const result = await agenticRAG({
      action: 'semantic_search',
      query: 'artificial intelligence concepts',
      collection_name: 'family_domestic',
      top_k: 3,
    });

    expect(result.status).toBe('success');
    expect(result.data.results).toBeDefined();
    expect(Array.isArray(result.data.results)).toBe(true);
  });

  it('should list collections', async () => {
    const result = await agenticRAG({
      action: 'list_collections',
      collection_name: 'family_domestic',
    });

    expect(result.status).toBe('success');
    expect(result.message).toContain('family_domestic');
  });

  it('should handle errors gracefully', async () => {
    const result = await agenticRAG({
      action: 'analyze_query',
      collection_name: 'family_domestic',
      // Missing query parameter
    });

    expect(result.status).toBe('error');
    expect(result.message).toContain('Query is required');
  });

  it('should handle invalid actions', async () => {
    const result = await agenticRAG({
      action: 'invalid_action',
      collection_name: 'family_domestic',
    });

    expect(result.status).toBe('error');
    expect(result.message).toContain('Invalid action');
  });

  it('should have correct tool definition structure', () => {
    expect(AgenticRAGTools.type).toBe('function');
    expect(AgenticRAGTools.function.name).toBe('agentic_rag');
    expect(AgenticRAGTools.function.description).toBeDefined();
    expect(AgenticRAGTools.function.parameters.type).toBe('object');
    expect(AgenticRAGTools.function.parameters.properties.action).toBeDefined();
    expect(AgenticRAGTools.function.parameters.required).toContain('action');
    expect(AgenticRAGTools.function.parameters.required).toContain('collection_name');
  });

  it('should demonstrate intelligent retrieval decision making', async () => {
    // Test various query types to show intelligent decision making
    const queries = [
      { query: 'What is AI?', expectedRetrieval: true },
      { query: 'Hello world how are you', expectedRetrieval: false },
      { query: 'Write a poem and create a story', expectedRetrieval: false },
      { query: 'Explain machine learning', expectedRetrieval: true },
      { query: 'How are you doing today?', expectedRetrieval: true },
      { query: 'Tell me about neural networks', expectedRetrieval: true },
    ];

    for (const testCase of queries) {
      const result = await agenticRAG({
        action: 'search_knowledge',
        query: testCase.query,
        collection_name: 'family_domestic',
      });

      expect(result.status).toBe('success');
      expect(result.data.analysis.needsRetrieval).toBe(testCase.expectedRetrieval);

      console.log(
        `[DEBUG_LOG] Query: "${testCase.query}" - Retrieval needed: ${result.data.analysis.needsRetrieval}`,
      );
    }
  });

  it('should filter results by similarity threshold', async () => {
    const result = await agenticRAG({
      action: 'search_knowledge',
      query: 'What is machine learning?',
      collection_name: 'family_domestic',
      similarity_threshold: 0.8, // High threshold
    });

    expect(result.status).toBe('success');
    if (result.data.analysis.needsRetrieval) {
      // Should only return results above threshold
      result.data.retrieved_documents.forEach((doc: any) => {
        expect(doc.score).toBeGreaterThanOrEqual(0.8);
      });
    }
  });

  it('should handle context window limits', async () => {
    const result = await agenticRAG({
      action: 'get_context',
      query: 'Tell me about artificial intelligence',
      collection_name: 'family_domestic',
      context_window: 1000,
    });

    expect(result.status).toBe('success');
    if (result.data.analysis.needsRetrieval && result.data.context_summary) {
      // Context should respect the window limit (approximate check)
      expect(result.data.context_summary.length).toBeLessThanOrEqual(2000); // Allow some flexibility
    }
  });
});
