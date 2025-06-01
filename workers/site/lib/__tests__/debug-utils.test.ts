import { describe, it, expect } from 'vitest';
import { Utils } from '../utils';

describe('Debug Utils.getSeason', () => {
  it('should print out the actual seasons for different dates', () => {
    // Test dates with more specific focus on boundaries
    const dates = [
      // June boundary (month 5)
      '2023-06-20', // June 20
      '2023-06-21', // June 21
      '2023-06-22', // June 22
      '2023-06-23', // June 23

      // September boundary (month 8)
      '2023-09-20', // September 20
      '2023-09-21', // September 21
      '2023-09-22', // September 22
      '2023-09-23', // September 23
      '2023-09-24', // September 24

      // Also check the implementation directly
      '2023-06-22', // month === 5 && day > 21 should be Summer
      '2023-09-23', // month === 8 && day > 22 should be Autumn
    ];

    // Print out the actual seasons
    console.log('Date | Month | Day | Season');
    console.log('-----|-------|-----|-------');
    dates.forEach(date => {
      const d = new Date(date);
      const month = d.getMonth();
      const day = d.getDate();
      const season = Utils.getSeason(date);
      console.log(`${date} | ${month} | ${day} | ${season}`);
    });

    // This test will always pass, it's just for debugging
    expect(true).toBe(true);
  });
});
