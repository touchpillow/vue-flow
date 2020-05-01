import { FlowLineConfig, TipLine } from "types/flow";

const defaultLineData: FlowLineConfig = {
  isOrigin: false,
  origin: {
    id: "",
    direction: 1,
    targetDirection: -1
  }
};
const circleDirection: TipLine = {
  top: -1,
  bottom: 1
};
export { circleDirection, defaultLineData };
