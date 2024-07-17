// ignoring TS here due to microsoft/TypeScript-DOM-lib-generator/1568
// https://github.com/microsoft/TypeScript-DOM-lib-generator/issues/1568

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

export function buildURLParams(input: SearchInput | SearchMonthInput) {
  return new URLSearchParams(input).toString();
}
