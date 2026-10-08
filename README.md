# posix-cron-parser

[![npm version](https://img.shields.io/npm/v/posix-cron-parser.svg?style=flat-square)](https://www.npmjs.com/package/posix-cron-parser)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Interactive Playground](https://img.shields.io/badge/Interactive_Playground-FastTools.me-1B4520?style=flat-square)](https://fasttools.me/crontab-generator)

A high-performance, zero-dependency, strict **POSIX IEEE 1003.1** compliant 5-field cron expression parser, natural English translator, and execution date scheduler for TypeScript and JavaScript.

> **Interactive Visual Workbench**: Test, debug, and visually edit any cron schedule with real-time execution graphs on the [FastTools Visual Crontab Generator](https://fasttools.me/crontab-generator).

---

## Features

- **Strict POSIX 5-Field Standard**: Validates `minute`, `hour`, `day of month`, `month`, and `day of week`.
- **Zero External Dependencies**: Pure TypeScript with zero runtime overhead and instant execution (<0.1ms).
- **Natural Language Translator**: Translates complex expressions like `*/15 9-17 * * 1-5` into plain English descriptions (*"Every 15 minutes, between 09:00 and 17:59, Monday through Friday"*).
- **Next Execution Calculator**: Accurately computes future run timestamps while handling leap years, 28/29/30/31-day month boundaries, and POSIX union rules.
- **POSIX Day Union Rule**: Correctly applies the standard POSIX union logic: when both day-of-month and day-of-week are specified, the job executes when *either* condition matches.
- **Special Aliases Support**: Native parsing for `@yearly`, `@annually`, `@monthly`, `@weekly`, `@daily`, `@midnight`, and `@hourly`.
- **Dual Module Support**: Full native ESM and CommonJS exports with complete TypeScript definitions.

---

## Installation

```bash
npm install posix-cron-parser
# or
yarn add posix-cron-parser
# or
pnpm add posix-cron-parser
```

---

## Quick Start

```typescript
import { parseCron, describeCron, getNextRuns, isValidCron } from 'posix-cron-parser';

// 1. Quick Validation
console.log(isValidCron('*/5 * * * *')); // true
console.log(isValidCron('60 * * * *'));  // false (minute out of range)

// 2. Parse 5-Field Expression
const parsed = parseCron('0 9 * * 1-5');
console.log(parsed.isValid); // true
console.log(parsed.hour.values); // [9]
console.log(parsed.dayOfWeek.values); // [1, 2, 3, 4, 5]

// 3. Human-Readable English Description
const description = describeCron(parsed);
console.log(description);
// "At 09:00, Monday through Friday"

// 4. Calculate Next Executions
const nextRuns = getNextRuns(parsed, new Date(), 5);
nextRuns.forEach((date, i) => {
  console.log(`Run ${i + 1}: ${date.toISOString()}`);
});
```

---

## Interactive Visual Tool

Need to design a schedule visually or share an interactive link with your team? Use our free, client-side web utility:

👉 **[FastTools Crontab Generator](https://fasttools.me/crontab-generator)**

- Visual 5-column grid selector
- Instant copyable shell command snippets (`crontab -e`)
- 25+ programmatic schedule presets ([Every 5 Minutes](https://fasttools.me/crontab-generator/every-5-minutes), [Every Hour](https://fasttools.me/crontab-generator/every-hour), [Daily at Midnight](https://fasttools.me/crontab-generator/daily), [Every Weekday](https://fasttools.me/crontab-generator/every-weekday))

---

## API Reference

### `parseCron(expression: string): ParsedCron`
Parses a 5-field cron string or alias. Returns the parsed fields, expanded matching integer sets, and validation status.

### `describeCron(parsed: ParsedCron): string`
Generates an English description of the execution frequency and schedule.

### `getNextRuns(parsed: ParsedCron, from: Date, count: number): Date[]`
Computes the next `count` execution instances chronologically from a starting `Date`.

### `isValidCron(expression: string): boolean`
Fast boolean syntax and range checker.

---

## Specification Reference

The parser strictly conforms to the POSIX crontab specification:

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12 or JAN - DEC)
│ │ │ │ ┌───────────── day of week (0 - 7 or SUN - SAT, 0 & 7 = Sunday)
│ │ │ │ │
* * * * *
```

---

## License

MIT © [Alfaz Mahmud Rizve](https://whoisalfaz.me) • Part of the [FastTools Network](https://fasttools.me)
