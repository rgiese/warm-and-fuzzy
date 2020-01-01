//
// Implements a slight variant of http://rfc.zeromq.org/spec:32
// -> Instead of using an ampersand as the 72'nd character, we use a comma
//    because Particle's function invocation API bails on ampersands in the function argument/payload
//    even though all other Z85-compliant special characters make it through.
//    Good times.
//
// Inspired by https://github.com/msealand/z85.node/blob/master/index.js

const encoderRing = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-:+=^!/*?,<>()[]{}@%$#".split(
  ""
);

export function Z85Encode(data: Uint8Array): string {
  let accumulator = 0;
  let bytesAccumulated = 0;
  let asString = "";

  const accumulateByte = (currentValue: number): void => {
    accumulator = ((accumulator << 8) + currentValue) >>> 0; // >>> -> coerce as uint32
    ++bytesAccumulated;

    if (bytesAccumulated % 4 === 0) {
      let divisor = 85 * 85 * 85 * 85;

      while (divisor >= 1) {
        const encoderRingIndex = Math.floor(accumulator / divisor) % 85;
        const encodedCharacter = encoderRing[encoderRingIndex];

        asString = asString.concat(encodedCharacter);

        divisor /= 85;
      }

      accumulator = 0;
    }
  };

  data.forEach(currentValue => accumulateByte(currentValue));

  while (bytesAccumulated % 4 !== 0) {
    // Tail padding of zeroes
    accumulateByte(0);
  }

  return asString;
}
