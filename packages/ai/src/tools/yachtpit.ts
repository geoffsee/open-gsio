export interface ShipControlResult {
  message: string;
  status: 'success' | 'error';
  data?: any;
}

/**
 * A mock interface for controlling a ship.
 */
export const YachtpitTools = {
  type: 'function',
  description: 'Interface for controlling a ship: set speed, change heading, report status, etc.',

  /**
   * Mock implementation of a ship control command.
   */
  function: {
    name: 'ship_control',
    parameters: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['set_speed', 'change_heading', 'report_status', 'stop'],
          description: 'Action to perform on the ship.',
        },
        value: {
          type: 'number',
          description:
            'Numeric value for the action, such as speed (knots) or heading (degrees). Only required for set_speed and change_heading.',
        },
      },
      required: ['action'],
      additionalProperties: false,
    },
  },
};

export function yachtpitAi(args: { action: string; value?: number }): Promise<ShipControlResult> {
  switch (args.action) {
    case 'set_speed':
      if (typeof args.value !== 'number') {
        return { status: 'error', message: 'Missing speed value.' };
      }
      return { status: 'success', message: `Speed set to ${args.value} knots.` };
    case 'change_heading':
      if (typeof args.value !== 'number') {
        return { status: 'error', message: 'Missing heading value.' };
      }
      return { status: 'success', message: `Heading changed to ${args.value} degrees.` };
    case 'report_status':
      // Return a simulated ship status
      return {
        status: 'success',
        message: 'Ship status reported.',
        data: {
          speed: 12,
          heading: 87,
          engine: 'nominal',
          position: { lat: 42.35, lon: -70.88 },
        },
      };
    case 'stop':
      return { status: 'success', message: 'Ship stopped.' };
    default:
      return { status: 'error', message: 'Invalid action.' };
  }
}
