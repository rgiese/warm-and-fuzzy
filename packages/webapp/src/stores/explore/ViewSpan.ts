enum ViewSpan {
  Day = "day",
  Week = "week",
}

export default ViewSpan;

export const ViewSpans = [ViewSpan.Day, ViewSpan.Week];

export function viewSpanToDays(viewSpan: ViewSpan): number {
  switch (viewSpan) {
    case ViewSpan.Day:
      return 1;
    case ViewSpan.Week:
      return 7;
    default:
      throw new Error(`Unexpected ViewSpan ${viewSpan}`);
  }
}
