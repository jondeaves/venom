/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable no-console */
export function logSeedOutput(title: string, obj: any): void {
  const titleStr = `${title} ${obj.id}`;
  const titleCharCount = titleStr.length;
  const boxWidth = 50;
  const titleSpacer = (boxWidth - titleCharCount) / 2;

  console.log(`${'='.repeat(boxWidth)}`);
  console.log(`${' '.repeat(titleSpacer)}${titleStr}${' '.repeat(titleSpacer)}`);
  console.log(`${'='.repeat(boxWidth)}`);
  console.log(obj);
  console.log('\n\n');
}
/* eslint-enable no-console */
/* eslint-enable @typescript-eslint/no-explicit-any */
/* eslint-enable @typescript-eslint/explicit-module-boundary-types */
