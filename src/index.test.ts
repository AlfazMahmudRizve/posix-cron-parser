import { describe, it, expect } from 'vitest';
import { parseCron, describeCron, getNextRuns, isValidCron } from './index';

describe('cron parser', () => {
  it('parses wildcards', () => {
    const res = parseCron('* * * * *');
    expect(res.isValid).toBe(true);
    expect(res.minute.values).toHaveLength(60);
    expect(res.hour.values).toHaveLength(24);
    expect(res.dayOfMonth.values).toHaveLength(31);
    expect(res.month.values).toHaveLength(12);
    expect(res.dayOfWeek.values).toHaveLength(7);
  });

  it('parses step values', () => {
    const res = parseCron('*/15 * * * *');
    expect(res.isValid).toBe(true);
    expect(res.minute.values).toEqual([0, 15, 30, 45]);
  });
  
  it('parses range with step', () => {
    const res = parseCron('1-10/2 * * * *');
    expect(res.isValid).toBe(true);
    expect(res.minute.values).toEqual([1, 3, 5, 7, 9]);
  });

  it('parses ranges', () => {
    const res = parseCron('1-5 * * * *');
    expect(res.isValid).toBe(true);
    expect(res.minute.values).toEqual([1, 2, 3, 4, 5]);
  });
  
  it('parses named days', () => {
    const res = parseCron('* * * * MON-FRI');
    expect(res.isValid).toBe(true);
    expect(res.dayOfWeek.values).toEqual([1, 2, 3, 4, 5]);
  });

  it('parses lists', () => {
    const res = parseCron('1,3,5,7 * * * *');
    expect(res.isValid).toBe(true);
    expect(res.minute.values).toEqual([1, 3, 5, 7]);
  });
  
  it('parses named months list', () => {
    const res = parseCron('* * * JAN,MAR,JUN *');
    expect(res.isValid).toBe(true);
    expect(res.month.values).toEqual([1, 3, 6]);
  });

  it('parses combined patterns', () => {
    const res = parseCron('1-5,10,15-20/2 * * * *');
    expect(res.isValid).toBe(true);
    expect(res.minute.values).toEqual([1, 2, 3, 4, 5, 10, 15, 17, 19]);
  });

  it('parses @daily', () => {
    const res = parseCron('@daily');
    expect(res.isValid).toBe(true);
    expect(res.minute.values).toEqual([0]);
    expect(res.hour.values).toEqual([0]);
  });

  it('parses @hourly', () => {
    const res = parseCron('@hourly');
    expect(res.isValid).toBe(true);
    expect(res.minute.values).toEqual([0]);
  });

  it('parses @weekly', () => {
    const res = parseCron('@weekly');
    expect(res.isValid).toBe(true);
    expect(res.dayOfWeek.values).toEqual([0]);
  });

  it('parses @monthly', () => {
    const res = parseCron('@monthly');
    expect(res.isValid).toBe(true);
    expect(res.dayOfMonth.values).toEqual([1]);
  });

  it('parses @yearly', () => {
    const res = parseCron('@yearly');
    expect(res.isValid).toBe(true);
    expect(res.month.values).toEqual([1]);
    expect(res.dayOfMonth.values).toEqual([1]);
  });
  
  it('rejects 6 fields', () => {
    const res = parseCron('* * * * * *');
    expect(res.isValid).toBe(false);
  });
  
  it('rejects empty string', () => {
    const res = parseCron('');
    expect(res.isValid).toBe(false);
  });
  
  it('rejects out of range values', () => {
    const res = parseCron('60 * * * *');
    expect(res.isValid).toBe(false);
  });

  it('describes Every minute', () => {
    expect(describeCron(parseCron('* * * * *'))).toBe('Every minute');
  });

  it('describes Every 5 minutes', () => {
    expect(describeCron(parseCron('*/5 * * * *'))).toBe('Every 5 minutes');
  });

  it('describes Every hour, at minute 0', () => {
    expect(describeCron(parseCron('0 * * * *'))).toBe('Every hour, at minute 0');
  });

  it('describes Every day at midnight', () => {
    expect(describeCron(parseCron('0 0 * * *'))).toBe('Every day at midnight (00:00)');
  });

  it('describes 09:30 MON-FRI', () => {
    expect(describeCron(parseCron('30 9 * * 1-5'))).toBe('At 09:30, Monday through Friday');
  });
  
  it('describes 1st of every month', () => {
    expect(describeCron(parseCron('0 0 1 * *'))).toBe('At midnight on the 1st of every month');
  });
  
  it('describes midnight every Sunday', () => {
    expect(describeCron(parseCron('0 0 * * 0'))).toBe('At midnight every Sunday');
  });
  
  it('describes Every 2 hours', () => {
    expect(describeCron(parseCron('0 */2 * * *'))).toBe('Every 2 hours, at minute 0');
  });

  it('getNextRuns calculates simple next run correctly', () => {
    const from = new Date('2026-01-15T10:30:00');
    const res = parseCron('*/5 * * * *');
    const runs = getNextRuns(res, from, 3);
    expect(runs).toHaveLength(3);
    expect(runs[0].getTime()).toBe(new Date('2026-01-15T10:35:00').getTime());
    expect(runs[1].getTime()).toBe(new Date('2026-01-15T10:40:00').getTime());
  });

  it('getNextRuns handles month boundaries correctly', () => {
    const from = new Date('2026-01-31T23:59:00');
    const res = parseCron('0 0 1 * *');
    const runs = getNextRuns(res, from, 1);
    expect(runs[0].getTime()).toBe(new Date('2026-02-01T00:00:00').getTime());
  });

  it('getNextRuns handles 31 day month restriction', () => {
    const from = new Date('2026-01-15T00:00:00');
    const res = parseCron('0 0 31 * *');
    const runs = getNextRuns(res, from, 2);
    expect(runs[0].getTime()).toBe(new Date('2026-01-31T00:00:00').getTime());
    expect(runs[1].getTime()).toBe(new Date('2026-03-31T00:00:00').getTime()); // Feb skipped
  });

  it('getNextRuns handles leap years', () => {
    const from = new Date('2024-02-28T00:00:00'); // Leap year
    const res = parseCron('0 0 29 2 *');
    const runs = getNextRuns(res, from, 1);
    expect(runs[0].getTime()).toBe(new Date('2024-02-29T00:00:00').getTime());
  });

  it('validates dow 7 === 0', () => {
    const res = parseCron('* * * * 7');
    expect(res.isValid).toBe(true);
    expect(res.dayOfWeek.values).toEqual([0]);
  });
});
