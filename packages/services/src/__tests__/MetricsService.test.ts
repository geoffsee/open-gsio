import { describe, expect, it } from 'vitest';

import MetricsService from '../metrics-service/MetricsService.ts';

describe('MetricsService', () => {
  it('should create a metrics service', () => {
    const metricsService = MetricsService.create();
    expect(metricsService).toBeTruthy();
  });
});
