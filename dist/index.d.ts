export interface CronField {
    raw: string;
    values: number[];
    min: number;
    max: number;
}
export interface ParsedCron {
    minute: CronField;
    hour: CronField;
    dayOfMonth: CronField;
    month: CronField;
    dayOfWeek: CronField;
    expression: string;
    isValid: boolean;
    error?: string;
}
export declare function parseCron(expression: string): ParsedCron;
export declare function isValidCron(expression: string): boolean;
export declare function describeCron(input: ParsedCron | string): string;
export declare function getNextRuns(input: ParsedCron | string, from?: Date, count?: number): Date[];
