// tools/basicValue.ts
export interface BasicValueResult {
  value: string;
}

export const BasicValueTool = {
  name: 'basicValue',
  type: 'function',
  description: 'Returns a basic value (timestamp-based) for testing',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
  function: async (): Promise<BasicValueResult> => {
    // generate something obviously basic
    const basic = `tool-called-${Date.now()}`;
    console.log('[BasicValueTool] returning:', basic);
    return { value: basic };
  },
};
