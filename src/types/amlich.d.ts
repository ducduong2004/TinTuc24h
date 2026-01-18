declare module 'amlich' {
  export function convertSolar2Lunar(
    dd: number,
    mm: number,
    yy: number,
    timeZone: number
  ): [number, number, number, number];

  export function convertLunar2Solar(
    dd: number,
    mm: number,
    yy: number,
    leap: number,
    timeZone: number
  ): [number, number, number];

  export function jdFromDate(dd: number, mm: number, yy: number): number;

  export function jdToDate(jd: number): [number, number, number];
}
