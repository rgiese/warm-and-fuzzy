import { flatbuffers } from "@grumpycorp/warm-and-fuzzy-shared";

export function firmwareFromModel(value: number): flatbuffers.Long {
  if (value < 0) {
    throw new Error("uint64Adapter only works for positive numbers.");
  }

  const uint32Max = 0xffffffff;

  const lowUint32 = (value >>> 0) & uint32Max;

  // JavaScript 64-bit math is the pit of sadness
  // - bit math only works on 32-bit values (which is why lowUint32 still works above)
  const valueAsHexString = value.toString(16);
  const highUint32AsHexString =
    valueAsHexString.length > 8 ? valueAsHexString.substr(0, valueAsHexString.length - 8) : "0";
  const highUint32 = Number.parseInt(highUint32AsHexString, 16);

  if (highUint32 > uint32Max) {
    throw new RangeError(`${value} is outside Int64 range`);
  }

  return flatbuffers.Long.create(lowUint32, highUint32);
}
