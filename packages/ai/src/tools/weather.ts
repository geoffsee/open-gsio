export async function getWeather(latitude: any, longitude: any) {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`,
  );
  const data = await response.json();
  return data.current.temperature_2m;
}

export const WeatherTool = {
  type: 'function',
  function: {
    name: 'get_weather',
    description: 'Get current temperature for provided coordinates in celsius.',
    parameters: {
      type: 'object',
      properties: {
        latitude: { type: 'number' },
        longitude: { type: 'number' },
      },
      required: ['latitude', 'longitude'],
      additionalProperties: false,
    },
    strict: true,
  },
};
