import { describe, expect, it } from 'vitest';

import MetricsService from '../MetricsService';

describe('MetricsService', () => {
  it('should create a metrics service', () => {
    const metricsService = MetricsService.create();
    expect(metricsService).toBeTruthy();
  });
});
