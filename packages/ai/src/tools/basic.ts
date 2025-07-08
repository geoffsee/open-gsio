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
export const WeatherTool = {
  name: 'get_weather',
  type: 'function',
  description: 'Get current temperature for a given location.',
  parameters: {
    type: 'object',
    properties: {
      location: {
        type: 'string',
        description: 'City and country e.g. Bogotá, Colombia',
      },
    },
    required: ['location'],
    additionalProperties: false,
  },
  function: {
    name: 'getCurrentTemperature',
    description: 'Get the current temperature for a specific location',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'The city and state, e.g., San Francisco, CA',
        },
        unit: {
          type: 'string',
          enum: ['Celsius', 'Fahrenheit'],
          description: "The temperature unit to use. Infer this from the user's location.",
        },
      },
      required: ['location', 'unit'],
    },
  },
};
