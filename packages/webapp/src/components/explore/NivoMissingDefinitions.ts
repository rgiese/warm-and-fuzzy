import React from "react";
import { Value } from "@nivo/scatterplot";
import { TimeScale } from "@nivo/scales";

interface CustomTooltipNode {
  index: number;
  id: string;
  x: number; // pixel coordinates
  y: number;
  size: number;
  style: {
    color: string;
  };

  data: {
    x: Value;
    y: Value;
    id: string; // ...same as above
    serieId: string;
    formattedX: string;
    formattedY: string;
  };
}

export type CustomTooltip = ({ node }: { node: CustomTooltipNode }) => React.ReactNode;

export interface TimeScaleEx extends TimeScale {
  // Properties missing from nivo's outdated TypeScript definitions
  min?: "auto" | number;
  max?: "auto" | number;
  useUTC?: boolean;
}
