declare module "date-fns" {
  export function differenceInCalendarDays(dateLeft: Date, dateRight: Date): number;
  export function eachDayOfInterval(interval: { start: Date; end: Date }): Date[];
  export function endOfDay(date: Date): Date;
  export function format(date: Date, formatString: string): string;
  export function startOfDay(date: Date): Date;
  export function subDays(date: Date, amount: number): Date;
}
