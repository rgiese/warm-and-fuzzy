export default function shallowUpdate<TBase extends object, TUpdate extends object>(
  base: TBase,
  update: TUpdate
): TBase {
  let merged = base;

  for (const key in base) {
    if (update.hasOwnProperty(key)) {
      const updateValue = (update as any)[key];

      if (updateValue !== null && updateValue !== undefined) {
        merged[key] = updateValue;
      }
    }
  }

  return merged;
}
