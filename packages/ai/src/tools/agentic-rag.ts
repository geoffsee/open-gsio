import { MilvusClient, DataType } from '@zilliz/milvus2-sdk-node';
import { OpenAI } from 'openai';

import { ProviderRepository } from '../providers/_ProviderRepository.ts';

/**
 * Configuration for the Agentic RAG system
 */
export interface AgenticRAGConfig {
  milvusAddress?: string;
  collectionName?: string;
  embeddingDimension?: number;
  topK?: number;
  similarityThreshold?: number;
}

/**
 * Result structure for Agentic RAG operations
 */
export interface AgenticRAGResult {
  message: string;
  status: 'success' | 'error';
  data?: any;
  context?: string[];
  relevanceScore?: number;
}

/**
 * Document structure for knowledge base
 */
export interface Document {
  id: string;
  content: string;
  metadata?: Record<string, any>;
  embedding?: number[];
}

/**
 * Agentic RAG Tools for intelligent retrieval-augmented generation
 * This system makes intelligent decisions about when and how to retrieve information
 */
export const AgenticRAGTools = {
  type: 'function',
  function: {
    name: 'agentic_rag',
    description:
      'Intelligent retrieval-augmented generation system that can store documents, search knowledge base, and provide contextual information based on user queries. The system intelligently decides when retrieval is needed.',
    parameters: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: [
            'list_collections',
            'report_status',
            'semantic_search',
            'search_knowledge',
            'analyze_query',
            'get_context',
          ],
          description: 'Action to perform with the agentic RAG system.',
        },
        query: {
          type: 'string',
          description: 'User query or search term for knowledge retrieval.',
        },
        // document: {
        //   type: 'object',
        //   properties: {
        //     content: { type: 'string', description: 'Document content to store' },
        //     metadata: { type: 'object', description: 'Additional metadata for the document' },
        //     id: { type: 'string', description: 'Unique identifier for the document' },
        //   },
        //   description: 'Document to store in the knowledge base.',
        // },
        collection_name: {
          type: 'string',
          // todo: make this fancy w/ dynamic collection
          enum: [
            'business_corporate',
            'civil_procedure',
            'criminal_justice',
            'education_professions',
            'environmental_infrastructure',
            'family_domestic',
            'foundational_law',
            'government_administration',
            'health_social_services',
            'miscellaneous',
            'property_real_estate',
            'special_documents',
            'taxation_finance',
            'transportation_motor_vehicles',
          ],
          description: 'Name of the collection to work with.',
        },
        top_k: {
          type: 'number',
          description: 'Number of similar documents to retrieve (default: 5).',
        },
        similarity_threshold: {
          type: 'number',
          description: 'Minimum similarity score for relevant results (0-1, default: 0.7).',
        },
        context_window: {
          type: 'number',
          description: 'Maximum number of context tokens to include (default: 2000).',
        },
      },
      required: ['action', 'collection_name'],
      additionalProperties: false,
    },
    strict: true,
  },
};

/**
 * Default configuration for the Agentic RAG system
 */
const DEFAULT_CONFIG: AgenticRAGConfig = {
  milvusAddress: 'localhost:19530',
  collectionName: 'family_domestic',
  embeddingDimension: 768,
  topK: 5,
  similarityThreshold: 0.5,
};

/**
 * Simple embedding function using a mock implementation
 * In production, this should use a real embedding service like OpenAI, Cohere, etc.
 */
async function generateEmbedding(text: string): Promise<number[] | undefined> {
  const embeddingsClient = new OpenAI({
    apiKey: process.env.FIREWORKS_API_KEY,
    baseURL: ProviderRepository.OPENAI_COMPAT_ENDPOINTS.fireworks,
  }).embeddings;

  const embeddings = await embeddingsClient.create({
    input: [text],
    model: 'nomic-ai/nomic-embed-text-v1.5',
    dimensions: 768,
  });
  return embeddings.data.at(0)?.embedding;
}

/**
 * Analyze query to determine if retrieval is needed
 */
function analyzeQueryForRetrieval(query: string): {
  needsRetrieval: boolean;
  confidence: number;
  reasoning: string;
  queryType: 'factual' | 'conversational' | 'creative' | 'analytical';
} {
  const lowerQuery = query.toLowerCase();

  // Keywords that suggest factual information is needed
  const factualKeywords = [
    'what is',
    'who is',
    'when did',
    'where is',
    'how does',
    'explain',
    'define',
    'describe',
    'tell me about',
    'information about',
    'details on',
    'facts about',
    'history of',
    'background on',
  ];

  // Keywords that suggest conversational/creative responses
  const conversationalKeywords = [
    'hello',
    'hi',
    'how are you',
    'thank you',
    'please help',
    'i think',
    'in my opinion',
    'what do you think',
    'can you help',
  ];

  // Keywords that suggest creative tasks
  const creativeKeywords = [
    'write a',
    'create a',
    'generate',
    'compose',
    'draft',
    'story',
    'poem',
    'essay',
    'letter',
    'email',
  ];

  let factualScore = 0;
  let conversationalScore = 0;
  let creativeScore = 0;

  factualKeywords.forEach(keyword => {
    if (lowerQuery.includes(keyword)) factualScore += 1;
  });

  conversationalKeywords.forEach(keyword => {
    if (lowerQuery.includes(keyword)) conversationalScore += 1;
  });

  creativeKeywords.forEach(keyword => {
    if (lowerQuery.includes(keyword)) creativeScore += 1;
  });

  // Determine query type and retrieval need
  if (factualScore > conversationalScore && factualScore > creativeScore) {
    return {
      needsRetrieval: true,
      confidence: Math.min(factualScore * 0.3, 0.9),
      reasoning:
        'Query appears to be asking for factual information that may benefit from knowledge retrieval.',
      queryType: 'factual',
    };
  } else if (creativeScore > conversationalScore && creativeScore > 1) {
    // Only skip retrieval for clearly creative tasks with multiple creative keywords
    return {
      needsRetrieval: false,
      confidence: 0.8,
      reasoning: 'Query appears to be requesting creative content generation.',
      queryType: 'creative',
    };
  } else if (conversationalScore > 1 && conversationalScore > factualScore) {
    // Only skip retrieval for clearly conversational queries with multiple conversational keywords
    return {
      needsRetrieval: false,
      confidence: 0.7,
      reasoning: 'Query appears to be conversational in nature.',
      queryType: 'conversational',
    };
  } else {
    // Default to retrieval for most cases to ensure comprehensive responses
    return {
      needsRetrieval: true,
      confidence: 0.8,
      reasoning: 'Defaulting to retrieval to provide comprehensive and accurate information.',
      queryType: 'analytical',
    };
  }
}

/**
 * Main Agentic RAG function that handles intelligent retrieval decisions
 */
export async function agenticRAG(args: {
  action: string;
  query?: string;
  document?: Document;
  collection_name?: string;
  top_k?: number;
  similarity_threshold?: number;
  context_window?: number;
  user_confirmed?: boolean;
}): Promise<AgenticRAGResult> {
  const config = { ...DEFAULT_CONFIG };
  const collectionName = args.collection_name || config.collectionName!;
  const topK = args.top_k || config.topK!;
  const similarityThreshold = args.similarity_threshold || config.similarityThreshold!;

  const milvusClient = new MilvusClient({ address: config.milvusAddress! });

  try {
    switch (args.action) {
      case 'analyze_query':
        if (!args.query) {
          return { status: 'error', message: 'Query is required for analysis.' };
        }

        // eslint-disable-next-line no-case-declarations
        const analysis = analyzeQueryForRetrieval(args.query);
        return {
          status: 'success',
          message: `Query analysis complete. Retrieval ${analysis.needsRetrieval ? 'recommended' : 'not needed'}.`,
          data: analysis,
        };

      case 'list_collections':
        // eslint-disable-next-line no-case-declarations
        const { collection_names } = (await milvusClient.listCollections()) as any as {
          collection_names: string[];
        };
        return {
          status: 'success',
          message: JSON.stringify(collection_names),
        };
      case 'search_knowledge':
        if (!args.query) {
          return { status: 'error', message: 'Query is required for knowledge search.' };
        }

        // First, analyze if retrieval is needed
        // eslint-disable-next-line no-case-declarations
        const queryAnalysis = analyzeQueryForRetrieval(args.query);

        if (!queryAnalysis.needsRetrieval) {
          return {
            status: 'success',
            message: 'Query analysis suggests retrieval is not needed for this type of query.',
            data: {
              analysis: queryAnalysis,
              retrieved_documents: [],
              context: [],
            },
          };
        }

        // Generate embedding for the query
        // eslint-disable-next-line no-case-declarations
        const queryEmbedding = await generateEmbedding(args.query);

        // Search for similar documents
        // eslint-disable-next-line no-case-declarations
        const searchResult = await milvusClient.search({
          collection_name: collectionName,
          vector: queryEmbedding,
          topk: topK,
          params: { nprobe: 8 },
          output_fields: ['content', 'metadata'],
        });

        // Filter results by similarity threshold
        // eslint-disable-next-line no-case-declarations
        const relevantResults = searchResult.results.filter(
          (result: any) => result.score >= similarityThreshold,
        );

        // eslint-disable-next-line no-case-declarations
        const contextDocuments = relevantResults.map((result: any) => ({
          content: result.content,
          score: result.score,
          metadata: result.metadata,
        }));

        return {
          status: 'success',
          message: `Found ${relevantResults.length} relevant documents for query.`,
          data: {
            analysis: queryAnalysis,
            retrieved_documents: contextDocuments,
            context: contextDocuments.map((doc: any) => doc.content),
          },
          context: contextDocuments.map((doc: any) => doc.content),
          relevanceScore: relevantResults.length > 0 ? relevantResults.at(0)?.score : 0,
        };

      case 'store_document':
        if (!args.document || !args.document.content) {
          return { status: 'error', message: 'Document with content is required for storage.' };
        }

        // Generate embedding for the document
        // eslint-disable-next-line no-case-declarations
        const docEmbedding = await generateEmbedding(args.document.content);
        // eslint-disable-next-line no-case-declarations
        const docId =
          args.document.id || `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Store document in Milvus
        await milvusClient.insert({
          collection_name: collectionName,
          fields_data: [
            { name: 'id', values: [docId] },
            { name: 'embedding', values: [docEmbedding] },
            { name: 'content', values: [args.document.content] },
            { name: 'metadata', values: [JSON.stringify(args.document.metadata || {})] },
          ],
        });

        return {
          status: 'success',
          message: `Document stored successfully with ID: ${docId}`,
          data: { document_id: docId, content_length: args.document.content.length },
        };

      case 'manage_collection':
        try {
          // Check if collection exists
          const collections = await milvusClient.listCollections();
          const collectionExists =
            collections.data.filter(c => c.name.includes(collectionName)).length > 0;

          if (!collectionExists) {
            // Create collection with proper schema for RAG
            const collectionSchema = {
              collection_name: collectionName,
              fields: [
                {
                  name: 'id',
                  type: DataType.VarChar,
                  params: { max_length: 100 },
                  is_primary_key: true,
                },
                {
                  name: 'embedding',
                  type: DataType.FloatVector,
                  params: { dim: config.embeddingDimension },
                },
                { name: 'content', type: DataType.VarChar, params: { max_length: 65535 } },
                { name: 'metadata', type: DataType.VarChar, params: { max_length: 1000 } },
              ],
            };

            await milvusClient.createCollection(collectionSchema as any);

            // Create index for efficient similarity search
            await milvusClient.createIndex({
              collection_name: collectionName,
              field_name: 'embedding',
              index_type: 'IVF_FLAT',
              params: { nlist: 1024 },
              metric_type: 'COSINE',
            });

            return {
              status: 'success',
              message: `Collection '${collectionName}' created successfully with RAG schema.`,
              data: { collection_name: collectionName, action: 'created' },
            };
          } else {
            return {
              status: 'success',
              message: `Collection '${collectionName}' already exists.`,
              data: { collection_name: collectionName, action: 'exists' },
            };
          }
        } catch (error: any) {
          return {
            status: 'error',
            message: `Error managing collection: ${error.message}`,
          };
        }

      case 'semantic_search':
        if (!args.query) {
          return { status: 'error', message: 'Query is required for semantic search.' };
        }

        // eslint-disable-next-line no-case-declarations
        const semanticEmbedding = await generateEmbedding(args.query);
        // eslint-disable-next-line no-case-declarations
        const semanticResults = await milvusClient.search({
          collection_name: collectionName,
          vector: semanticEmbedding,
          topk: topK,
          params: { nprobe: 8 },
          output_fields: ['content', 'metadata'],
        });

        return {
          status: 'success',
          message: `Semantic search completed. Found ${semanticResults.results.length} results.`,
          data: {
            results: semanticResults.results.map((result: any) => ({
              content: result.content,
              score: result.score,
              metadata: JSON.parse(result.metadata || '{}'),
            })),
          },
        };

      case 'get_context':
        if (!args.query) {
          return { status: 'error', message: 'Query is required to get context.' };
        }

        // This is a comprehensive context retrieval that combines analysis and search
        // eslint-disable-next-line no-case-declarations
        const contextAnalysis = analyzeQueryForRetrieval(args.query);
        if (contextAnalysis.needsRetrieval) {
          const contextEmbedding = await generateEmbedding(args.query);
          const contextSearch = await milvusClient.search({
            collection_name: collectionName,
            vector: contextEmbedding,
            topk: topK,
            params: { nprobe: 8 },
            output_fields: ['content', 'metadata'],
          });

          const contextResults = contextSearch.results
            .filter((result: any) => result.score >= similarityThreshold)
            .map((result: any) => ({
              content: result.content,
              score: result.score,
              metadata: JSON.parse(result.metadata || '{}'),
            }));

          return {
            status: 'success',
            message: `Context retrieved successfully. Found ${contextResults.length} relevant documents.`,
            data: {
              analysis: contextAnalysis,
              context_documents: contextResults,
              context_summary: contextResults.map((doc: any) => doc.content).join('\n\n'),
            },
            context: contextResults.map((doc: any) => doc.content),
          };
        } else {
          return {
            status: 'success',
            message: 'No context retrieval needed for this query type.',
            data: {
              analysis: contextAnalysis,
              context_documents: [],
              context_summary: '',
            },
          };
        }

      default:
        return { status: 'error', message: 'Invalid action specified.' };
    }
  } catch (error: any) {
    return {
      status: 'error',
      message: `Integration error: ${error.message}`,
    };
  }
}
