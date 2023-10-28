import { flatbuffers } from "@grumpycorp/warm-and-fuzzy-shared";

export function firmwareFromModel(oneWireId: string): flatbuffers.Long {
  const parseHexUint32 = (str: string): number => {
    // Firmware treats OneWire IDs as little-endian, i.e. lowest byte is printed first
    return (
      (parseInt(str.substr(0, 2), 16) << 0) +
      (parseInt(str.substr(2, 2), 16) << 8) +
      (parseInt(str.substr(4, 2), 16) << 16) +
      (parseInt(str.substr(6, 2), 16) << 24)
    );
  };

  const idLow = parseHexUint32(oneWireId.substr(0, 8));
  const idHigh = parseHexUint32(oneWireId.substr(8, 8));

  return flatbuffers.Long.create(idLow, idHigh);
}
