export const compareMaybeDate = (
  lhs: Date | undefined | null,
  rhs: Date | undefined | null
): number => {
  if ((lhs?.valueOf() || 0) < (rhs?.valueOf() || 0)) {
    return -1;
  }
  if ((lhs?.valueOf() || 0) > (rhs?.valueOf() || 0)) {
    return 1;
  }
  return 0;
};

export const compareMaybeNumber = (
  lhs: number | null | undefined,
  rhs: number | null | undefined
): number => {
  if ((lhs || 0) < (rhs || 0)) {
    return -1;
  }
  if ((lhs || 0) > (rhs || 0)) {
    return 1;
  }
  return 0;
};
