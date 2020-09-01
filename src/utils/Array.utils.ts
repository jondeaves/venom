export function arraySum<T>(arr: T[], getValue?: (element: T) => number): number {
  return arr.reduce((all, cur) => all + (getValue?.(cur) ?? ((cur as unknown) as number)), 0);
}
