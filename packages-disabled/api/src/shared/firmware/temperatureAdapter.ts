export function firmwareFromModel(temperature: number): number {
  return Math.round(temperature * 100);
}
