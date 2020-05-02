import { FlowLineConfig, TipLine, FlowTipConfig } from "types/flow";

const defaultLineData: FlowLineConfig = {
  isOrigin: false,
  origin: {
    id: "",
    direction: 1,
    targetDirection: -1,
  },
};
const circleDirection: TipLine = {
  top: -1,
  bottom: 1,
};
const flowTipConfig: FlowTipConfig = {
  vertical: {
    key: "y",
    item: "h",
  },
  horizontal: {
    key: "x",
    item: "w",
  },
};
export { circleDirection, defaultLineData, flowTipConfig };
