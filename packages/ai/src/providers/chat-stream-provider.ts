import { OpenAI } from 'openai';

import ChatSdk from '../chat-sdk/chat-sdk.ts';
import { agenticRAG, AgenticRAGTools } from '../tools/agentic-rag.ts';
import type { GenericEnv } from '../types';

export interface CommonProviderParams {
  openai?: OpenAI; // Optional for providers that use a custom client.
  systemPrompt: any;
  preprocessedContext: any;
  maxTokens: number | unknown | undefined;
  messages: any;
  model: string;
  env: GenericEnv;
  disableWebhookGeneration?: boolean;
  // Additional fields can be added as needed
}

export interface ChatStreamProvider {
  handleStream(param: CommonProviderParams, dataCallback: (data: any) => void): Promise<any>;
}

export abstract class BaseChatProvider implements ChatStreamProvider {
  abstract getOpenAIClient(param: CommonProviderParams): OpenAI;
  abstract getStreamParams(param: CommonProviderParams, safeMessages: any[]): any;
  abstract processChunk(chunk: any, dataCallback: (data: any) => void): Promise<boolean>;

  async handleStream(param: CommonProviderParams, dataCallback: (data: any) => void) {
    const assistantPrompt = ChatSdk.buildAssistantPrompt({ maxTokens: param.maxTokens });
    const safeMessages = await ChatSdk.buildMessageChain(param.messages, {
      systemPrompt: param.systemPrompt,
      model: param.model,
      assistantPrompt,
      toolResults: param.preprocessedContext,
      env: param.env,
    });

    const client = this.getOpenAIClient(param);

    const tools = [AgenticRAGTools];

    const callFunction = async (name, args) => {
      if (name === 'agentic_rag') {
        return agenticRAG(args);
      }
    };

    // Main conversation loop - handle tool calls properly
    let conversationComplete = false;
    let toolCallIterations = 0;
    const maxToolCallIterations = 5; // Prevent infinite loops
    let toolsExecuted = false; // Track if we've executed tools
    const attemptedToolCalls = new Set<string>(); // Track attempted tool calls to prevent duplicates

    while (!conversationComplete && toolCallIterations < maxToolCallIterations) {
      const streamParams = this.getStreamParams(param, safeMessages);
      // Only provide tools on the first call, after that force text response
      const currentTools = toolsExecuted ? undefined : tools;

      const stream = await client.chat.completions.create({ ...streamParams, tools: currentTools });

      let assistantMessage = '';
      const toolCalls: any[] = [];

      for await (const chunk of stream as unknown as AsyncIterable<any>) {
        // console.log('chunk', chunk);

        // Handle tool calls
        if (chunk.choices[0]?.delta?.tool_calls) {
          const deltaToolCalls = chunk.choices[0].delta.tool_calls;

          for (const deltaToolCall of deltaToolCalls) {
            if (deltaToolCall.index !== undefined) {
              // Initialize or get existing tool call
              if (!toolCalls[deltaToolCall.index]) {
                toolCalls[deltaToolCall.index] = {
                  id: deltaToolCall.id || '',
                  type: deltaToolCall.type || 'function',
                  function: {
                    name: deltaToolCall.function?.name || '',
                    arguments: deltaToolCall.function?.arguments || '',
                  },
                };
              } else {
                // Append to existing tool call
                if (deltaToolCall.function?.arguments) {
                  toolCalls[deltaToolCall.index].function.arguments +=
                    deltaToolCall.function.arguments;
                }
                if (deltaToolCall.function?.name) {
                  toolCalls[deltaToolCall.index].function.name += deltaToolCall.function.name;
                }
                if (deltaToolCall.id) {
                  toolCalls[deltaToolCall.index].id += deltaToolCall.id;
                }
              }
            }
          }
        }

        // Handle regular content
        if (chunk.choices[0]?.delta?.content) {
          assistantMessage += chunk.choices[0].delta.content;
        }

        // Check if stream is finished
        if (chunk.choices[0]?.finish_reason) {
          if (chunk.choices[0].finish_reason === 'tool_calls' && toolCalls.length > 0) {
            // Increment tool call iterations counter
            toolCallIterations++;
            console.log(`Tool call iteration ${toolCallIterations}/${maxToolCallIterations}`);

            // Execute tool calls and add results to conversation
            console.log('Executing tool calls:', toolCalls);

            // Limit to one tool call per iteration to prevent concurrent execution issues
            // Also filter out duplicate tool calls
            const uniqueToolCalls = toolCalls.filter(toolCall => {
              const toolCallKey = `${toolCall.function.name}:${toolCall.function.arguments}`;
              return !attemptedToolCalls.has(toolCallKey);
            });
            const toolCallsToExecute = uniqueToolCalls.slice(0, 1);

            if (toolCallsToExecute.length === 0) {
              console.log('All tool calls have been attempted already, forcing completion');
              toolsExecuted = true;
              conversationComplete = true;
              break;
            }

            // Send feedback to user about tool invocation
            dataCallback({
              type: 'chat',
              data: {
                choices: [
                  {
                    delta: {
                      content: `\n\n🔧 Invoking ${toolCallsToExecute.length} tool${toolCallsToExecute.length > 1 ? 's' : ''}...\n`,
                    },
                  },
                ],
              },
            });

            // Add assistant message with tool calls to conversation
            safeMessages.push({
              role: 'assistant',
              content: assistantMessage || null,
              tool_calls: toolCallsToExecute,
            });

            // Execute each tool call and add results
            let needsMoreRetrieval = false;
            for (const toolCall of toolCallsToExecute) {
              if (toolCall.type === 'function') {
                const name = toolCall.function.name;
                console.log(`Calling function: ${name}`);

                // Track this tool call attempt
                const toolCallKey = `${toolCall.function.name}:${toolCall.function.arguments}`;
                attemptedToolCalls.add(toolCallKey);

                // Send feedback about specific tool being called
                dataCallback({
                  type: 'chat',
                  data: {
                    choices: [
                      {
                        delta: {
                          content: `📞 Calling ${name}...`,
                        },
                      },
                    ],
                  },
                });

                try {
                  const args = JSON.parse(toolCall.function.arguments);
                  console.log(`Function arguments:`, args);

                  const result = await callFunction(name, args);
                  console.log(`Function result:`, result);

                  // Check if agentic-rag indicates more retrieval is needed
                  if (
                    name === 'agentic_rag' &&
                    result?.data?.analysis?.needsRetrieval === true &&
                    (!result?.data?.retrieved_documents ||
                      result.data.retrieved_documents.length === 0)
                  ) {
                    needsMoreRetrieval = true;
                    console.log('Agentic RAG indicates more retrieval needed');

                    // Add context about previous attempts to help LLM make better decisions
                    const attemptedActions = Array.from(attemptedToolCalls)
                      .filter(key => key.startsWith('agentic_rag:'))
                      .map(key => {
                        try {
                          const args = JSON.parse(key.split(':', 2)[1]);
                          return `${args.action} with query: "${args.query}"`;
                        } catch {
                          return 'unknown action';
                        }
                      });

                    if (attemptedActions.length > 0) {
                      safeMessages.push({
                        role: 'system',
                        content: `Previous retrieval attempts: ${attemptedActions.join(', ')}. Consider trying a different approach or more specific query.`,
                      });
                    }
                  }

                  // Send feedback about tool completion
                  dataCallback({
                    type: 'chat',
                    data: {
                      choices: [
                        {
                          delta: {
                            content: ` ✅\n ${JSON.stringify(result)}`,
                          },
                        },
                      ],
                    },
                  });

                  // Add tool result to conversation
                  safeMessages.push({
                    role: 'tool',
                    tool_call_id: toolCall.id,
                    content: JSON.stringify(result),
                  });
                } catch (error) {
                  console.error(`Error executing tool ${name}:`, error);

                  // Send feedback about tool error
                  dataCallback({
                    type: 'chat',
                    data: {
                      choices: [
                        {
                          delta: {
                            content: ` ❌ Error\n`,
                          },
                        },
                      ],
                    },
                  });

                  safeMessages.push({
                    role: 'tool',
                    tool_call_id: toolCall.id,
                    content: `Error: ${error.message}`,
                  });
                }
              }
            }

            // Only mark tools as executed if we don't need more retrieval
            if (!needsMoreRetrieval) {
              toolsExecuted = true;
            }

            // Send feedback that tool execution is complete
            dataCallback({
              type: 'chat',
              data: {
                choices: [
                  {
                    delta: {
                      content: `\n🎯 Tool execution complete. Generating response...\n\n`,
                    },
                  },
                ],
              },
            });

            // Continue conversation with tool results
            break;
          } else {
            // Regular completion - send final response
            conversationComplete = true;
          }
        }

        // Process chunk normally for non-tool-call responses
        if (!chunk.choices[0]?.delta?.tool_calls) {
          // console.log('after-tool-call-chunk', chunk);
          const shouldBreak = await this.processChunk(chunk, dataCallback);
          if (shouldBreak) {
            conversationComplete = true;
            break;
          }
        }
      }
    }

    // Handle case where we hit maximum tool call iterations
    if (toolCallIterations >= maxToolCallIterations && !conversationComplete) {
      console.log('Maximum tool call iterations reached, forcing completion');

      // Send a message indicating we've hit the limit and provide available information
      dataCallback({
        type: 'chat',
        data: {
          choices: [
            {
              delta: {
                content:
                  '\n\n⚠️ Maximum tool execution limit reached. Based on the available information, I can provide the following response:\n\n',
              },
            },
          ],
        },
      });

      // Make one final call without tools to get a response based on the tool results
      const finalStreamParams = this.getStreamParams(param, safeMessages);
      const finalStream = await client.chat.completions.create({
        ...finalStreamParams,
        tools: undefined, // Remove tools to force a text response
      });

      for await (const chunk of finalStream as unknown as AsyncIterable<any>) {
        const shouldBreak = await this.processChunk(chunk, dataCallback);
        if (shouldBreak) break;
      }
    }
  }
}
